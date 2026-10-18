import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { motion, AnimatePresence } from 'motion/react';

/**
 * A real-time 3D anniversary cake (three.js). Candle flames are a noise-driven
 * shader (after "The Lonely Candle" by prisoner849). Swipe across the cake to
 * blow the candles out; tap "Nyalakan lagi" to relight.
 */

const flameVertex = /* glsl */ `
  uniform float uTime;
  uniform float uSeed;
  uniform float uLife;
  varying float vY;
  varying vec2 vUv;
  float hash(vec2 p){ return fract(sin(dot(p, vec2(12.9898,78.233))) * 43758.5453); }
  float noise(vec2 p){
    vec2 i = floor(p); vec2 f = fract(p);
    vec2 u = f*f*(3.0-2.0*f);
    return mix(mix(hash(i), hash(i+vec2(1,0)), u.x), mix(hash(i+vec2(0,1)), hash(i+vec2(1,1)), u.x), u.y);
  }
  void main(){
    vUv = uv;
    vec3 p = position;
    float h = clamp(p.y, 0.0, 1.0);
    vY = h;
    // teardrop: narrow towards the tip
    float taper = mix(1.0, 0.18, pow(h, 1.3));
    p.xz *= taper;
    float t = uTime * 1.0 + uSeed * 10.0;
    // height flicker
    p.y *= (1.0 + (noise(vec2(t*3.0, uSeed)) - 0.5) * 0.35) * uLife;
    // sway, stronger at the tip
    p.x += (noise(vec2(t*2.2, h*3.0 - t)) - 0.5) * 0.35 * h * h;
    p.z += (noise(vec2(t*1.7 + 4.0, h*3.0 - t)) - 0.5) * 0.25 * h * h;
    p.xz *= uLife;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
  }
`;

const flameFragment = /* glsl */ `
  uniform float uLife;
  varying float vY;
  void main(){
    vec3 core = vec3(1.0, 0.98, 0.86);
    vec3 mid = vec3(1.0, 0.72, 0.28);
    vec3 tip = vec3(0.95, 0.38, 0.12);
    vec3 col = mix(core, mid, smoothstep(0.05, 0.55, vY));
    col = mix(col, tip, smoothstep(0.55, 1.0, vY));
    // blue base like a real candle
    col = mix(vec3(0.35, 0.55, 1.0), col, smoothstep(0.0, 0.12, vY));
    float a = (1.0 - smoothstep(0.7, 1.0, vY)) * 0.95 * uLife;
    gl_FragColor = vec4(col * 1.4, a);
  }
`;

function glowTexture() {
  const c = document.createElement('canvas');
  c.width = c.height = 128;
  const g = c.getContext('2d')!;
  const grd = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  grd.addColorStop(0, 'rgba(255,220,150,0.9)');
  grd.addColorStop(0.25, 'rgba(255,170,80,0.35)');
  grd.addColorStop(1, 'rgba(255,140,60,0)');
  g.fillStyle = grd;
  g.fillRect(0, 0, 128, 128);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

function smokeTexture() {
  const c = document.createElement('canvas');
  c.width = c.height = 64;
  const g = c.getContext('2d')!;
  const grd = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  grd.addColorStop(0, 'rgba(200,200,205,0.55)');
  grd.addColorStop(1, 'rgba(200,200,205,0)');
  g.fillStyle = grd;
  g.fillRect(0, 0, 64, 64);
  return new THREE.CanvasTexture(c);
}

function stripeTexture(a: string, b: string) {
  const c = document.createElement('canvas');
  c.width = 64; c.height = 256;
  const g = c.getContext('2d')!;
  g.fillStyle = a; g.fillRect(0, 0, 64, 256);
  g.fillStyle = b;
  for (let y = -64; y < 320; y += 40) {
    g.beginPath();
    g.moveTo(0, y); g.lineTo(64, y + 32); g.lineTo(64, y + 48); g.lineTo(0, y + 16);
    g.closePath(); g.fill();
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  return t;
}

type Candle = {
  flame: THREE.Mesh;
  mat: THREE.ShaderMaterial;
  glow: THREE.Sprite;
  light: THREE.PointLight;
  life: number; // 0..1
  target: number;
  tip: THREE.Vector3;
};

export const Cake3D: React.FC<{ title?: string }> = ({ title = 'Make a wish, sayang.' }) => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const api = useRef<{ blow: () => void; relight: () => void } | null>(null);
  const [out, setOut] = useState(false);

  useEffect(() => {
    const mount = mountRef.current!;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    mount.appendChild(renderer.domElement);
    renderer.domElement.style.display = 'block';

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
    camera.position.set(0, 4.6, 9.6);
    camera.lookAt(0, 1.85, 0);

    // Lights: soft daylight + warm candle glow
    const hemi = new THREE.HemisphereLight(0xf2f6fb, 0xd9c7b5, 1.15);
    scene.add(hemi);
    const key = new THREE.DirectionalLight(0xffffff, 1.6);
    key.position.set(4, 7, 5);
    key.castShadow = true;
    key.shadow.mapSize.set(1024, 1024);
    key.shadow.camera.left = -4; key.shadow.camera.right = 4;
    key.shadow.camera.top = 5; key.shadow.camera.bottom = -4;
    key.shadow.radius = 6;
    scene.add(key);
    const rim = new THREE.DirectionalLight(0xb9d3f0, 0.8);
    rim.position.set(-5, 3, -4);
    scene.add(rim);

    const root = new THREE.Group();
    scene.add(root);

    // Ground shadow catcher
    const ground = new THREE.Mesh(new THREE.CircleGeometry(6, 64), new THREE.ShadowMaterial({ opacity: 0.12 }));
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    // Cake stand / plate
    const plateMat = new THREE.MeshPhysicalMaterial({ color: 0xffffff, roughness: 0.15, clearcoat: 1, clearcoatRoughness: 0.1 });
    const plate = new THREE.Mesh(new THREE.CylinderGeometry(2.45, 2.3, 0.12, 96), plateMat);
    plate.position.y = 0.36;
    plate.castShadow = plate.receiveShadow = true;
    root.add(plate);
    const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.8, 0.32, 48), plateMat);
    stem.position.y = 0.16;
    stem.castShadow = true;
    root.add(stem);

    const std = (color: number, roughness = 0.45, extra: Partial<THREE.MeshStandardMaterialParameters> = {}) =>
      new THREE.MeshStandardMaterial({ color, roughness, ...extra });
    const skyPale = std(0xbcd4ec, 0.5);
    const sky = std(0x8fb4dc, 0.45);
    const blush = std(0xf6c6d4, 0.5);
    const blushDeep = std(0xeeaabd, 0.45);
    const creamM = std(0xfffbf5, 0.35);
    const ivory = std(0xfaf3ea, 0.55);
    const rose = std(0xd98c7a, 0.4);
    const gold = std(0xe6c792, 0.28, { metalness: 0.25, emissive: 0x3a2a10, emissiveIntensity: 0.25 });
    const white = std(0xffffff, 0.3);
    const skin = std(0xfbe3d6, 0.6);
    const hairM = std(0xe9c46a, 0.42);
    const dark = std(0x3a2a24, 0.4);
    const rand = (() => { let s = 7; return () => ((s = (s * 16807) % 2147483647) / 2147483647); })();
    const sphere = (r: number, seg = 16) => new THREE.SphereGeometry(r, seg, Math.max(8, seg * 0.75));
    const onWall = (r: number, a: number, y: number, out = 0) => new THREE.Vector3(Math.cos(a) * (r + out), y, Math.sin(a) * (r + out));

    // Tiers: [radius, bottomY, height, material]
    const T = [
      { r: 1.95, y0: 0.42, h: 0.9, m: skyPale },
      { r: 1.45, y0: 1.32, h: 0.8, m: blush },
      { r: 1.0, y0: 2.12, h: 0.72, m: ivory },
    ];
    T.forEach((t) => {
      const mesh = new THREE.Mesh(new THREE.CylinderGeometry(t.r, t.r, t.h, 96), t.m);
      mesh.position.y = t.y0 + t.h / 2;
      mesh.castShadow = mesh.receiveShadow = true;
      root.add(mesh);
    });
    const TOP = T[2].y0 + T[2].h; // 2.84

    // Drips (bottom: white; top: alternating sky / blush)
    const drips = (r: number, topY: number, mats: THREE.Material[]) => {
      const cap = new THREE.Mesh(new THREE.CylinderGeometry(r + 0.02, r + 0.02, 0.06, 96), mats[0]);
      cap.position.y = topY;
      root.add(cap);
      const n = Math.round(r * 16);
      for (let i = 0; i < n; i++) {
        const a = (i / n) * Math.PI * 2;
        const len = 0.12 + rand() * 0.28;
        const m = mats[Math.floor(i / 3) % mats.length];
        const d = new THREE.Mesh(new THREE.CapsuleGeometry(0.065, len, 4, 10), m);
        d.position.copy(onWall(r, a, topY - len / 2 - 0.02, 0.015));
        d.castShadow = true;
        root.add(d);
      }
      if (mats.length > 1) {
        // second-colour cap half
        const cap2 = new THREE.Mesh(new THREE.CylinderGeometry(r + 0.021, r + 0.021, 0.062, 96, 1, false, 0, Math.PI), mats[1]);
        cap2.position.y = topY;
        root.add(cap2);
      }
    };
    drips(T[0].r, T[0].y0 + T[0].h, [creamM]);
    drips(T[2].r, TOP, [std(0xa9c6e6, 0.35), std(0xf3bccd, 0.35)]);

    // Pearl rows at each tier base
    const pearls = (r: number, y: number, m: THREE.Material, size: number) => {
      const n = Math.round(r * 19);
      for (let i = 0; i < n; i++) {
        const p = new THREE.Mesh(sphere(size, 14), m);
        p.position.copy(onWall(r, (i / n) * Math.PI * 2, y + size * 0.85, 0.02));
        root.add(p);
      }
    };
    pearls(T[0].r, T[0].y0, white, 0.085);
    pearls(T[1].r, T[1].y0, gold, 0.055);
    pearls(T[2].r, T[2].y0, gold, 0.05);

    // Gold ribbon bands
    const band = (r: number, y: number, h: number) => {
      const b = new THREE.Mesh(new THREE.CylinderGeometry(r + 0.012, r + 0.012, h, 96, 1, true), gold);
      b.position.y = y;
      root.add(b);
    };
    band(T[1].r, T[1].y0 + 0.36, 0.13);
    band(T[2].r, T[2].y0 + 0.12, 0.08);

    // Bow on the pink tier (front)
    const bow = new THREE.Group();
    const loopGeo = new THREE.TorusGeometry(0.11, 0.035, 10, 24);
    const l1 = new THREE.Mesh(loopGeo, gold); l1.scale.set(1.3, 0.75, 0.6); l1.position.x = -0.13; bow.add(l1);
    const l2 = new THREE.Mesh(loopGeo, gold); l2.scale.set(1.3, 0.75, 0.6); l2.position.x = 0.13; bow.add(l2);
    const knot = new THREE.Mesh(sphere(0.055), gold); knot.scale.set(1, 0.9, 0.7); bow.add(knot);
    [-1, 1].forEach((s) => {
      const tail = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.2, 0.02), gold);
      tail.position.set(0.05 * s, -0.12, 0); tail.rotation.z = 0.35 * s; bow.add(tail);
    });
    bow.position.set(0, T[1].y0 + 0.36, T[1].r + 0.05);
    root.add(bow);

    // Sugar roses, white blossoms, macarons
    const petalGeo = new THREE.SphereGeometry(0.05, 12, 8);
    const addRose = (pos: THREE.Vector3, s = 1, m: THREE.Material = rose) => {
      const g = new THREE.Group();
      const core = new THREE.Mesh(sphere(0.032, 12), m); core.scale.set(1, 1, 1.2); core.position.z = 0.03; g.add(core);
      [[5, 0.035, 0.6, 0.02], [7, 0.062, 0.85, 0.0], [9, 0.088, 1.05, -0.02]].forEach(([n, rad, sc, z], ring) => {
        for (let k = 0; k < n; k++) {
          const a = (k / n) * Math.PI * 2 + ring * 0.4;
          const pt = new THREE.Mesh(petalGeo, m);
          pt.scale.set(sc, sc * 0.9, sc * 0.35);
          pt.position.set(Math.cos(a) * rad, Math.sin(a) * rad, z);
          pt.rotation.set(Math.sin(a) * 0.6, -Math.cos(a) * 0.6, a);
          g.add(pt);
        }
      });
      g.scale.setScalar(s);
      g.position.copy(pos);
      g.lookAt(pos.clone().multiplyScalar(2).setY(pos.y));
      root.add(g);
    };
    const addBlossom = (pos: THREE.Vector3, s = 1) => {
      const g = new THREE.Group();
      for (let k = 0; k < 5; k++) {
        const a = (k / 5) * Math.PI * 2;
        const p = new THREE.Mesh(sphere(0.035 * s, 10), white);
        p.scale.set(1, 1, 0.45);
        p.position.set(Math.cos(a) * 0.04 * s, Math.sin(a) * 0.04 * s, 0);
        g.add(p);
      }
      const c = new THREE.Mesh(sphere(0.02 * s, 8), gold); c.position.z = 0.01; g.add(c);
      g.position.copy(pos);
      g.lookAt(pos.clone().multiplyScalar(2).setY(pos.y));
      root.add(g);
    };
    const addMacaron = (pos: THREE.Vector3, shell: THREE.Material) => {
      const g = new THREE.Group();
      [-1, 1].forEach((s) => {
        const half = new THREE.Mesh(sphere(0.13, 20), shell);
        half.scale.set(1, 0.42, 1);
        half.position.y = 0.04 * s;
        g.add(half);
      });
      const fill = new THREE.Mesh(new THREE.CylinderGeometry(0.115, 0.115, 0.04, 24), creamM);
      g.add(fill);
      g.position.copy(pos);
      g.lookAt(pos.clone().multiplyScalar(2).setY(pos.y));
      g.rotateX(Math.PI / 2 - 0.35);
      g.traverse((o) => ((o as THREE.Mesh).castShadow = true));
      root.add(g);
    };

    // Diagonal cascade of roses + blossoms (top-right down to bottom-left, front side)
    const cascade: [number, number, number, number][] = [
      // [tierIdx, angle, yOffset, size]
      [2, 0.75, 0.38, 1.0], [2, 0.95, 0.18, 0.8],
      [1, 1.15, 0.6, 1.15], [1, 1.35, 0.3, 0.9], [1, 1.55, 0.62, 0.75],
      [0, 1.8, 0.62, 1.25], [0, 2.05, 0.35, 1.0], [0, 2.25, 0.68, 0.8],
    ];
    cascade.forEach(([ti, a, yo, s], i) => {
      const t = T[ti];
      addRose(onWall(t.r, a, t.y0 + yo, 0.05), s, i % 3 === 1 ? blushDeep : rose);
      addBlossom(onWall(t.r, a + 0.16, t.y0 + yo + 0.12, 0.02), 1);
      addBlossom(onWall(t.r, a - 0.12, t.y0 + yo - 0.14, 0.02), 0.85);
    });
    // a second smaller cascade on the back so the rotation stays busy
    [[1, 4.3, 0.45], [0, 4.6, 0.5], [2, 4.0, 0.35]].forEach(([ti, a, yo]) => {
      const t = T[ti as number];
      addRose(onWall(t.r, a as number, t.y0 + (yo as number), 0.05), 0.9);
      addBlossom(onWall(t.r, (a as number) + 0.15, t.y0 + (yo as number) + 0.1, 0.02), 0.9);
    });
    // macarons leaning on the ledges
    const macShells = [blush, skyPale, std(0xf3d9b8, 0.5)];
    [[0, 0.5], [0, 2.9], [0, 4.0], [0, 5.4], [1, 0.3], [1, 2.6], [1, 3.9], [1, 5.3]].forEach(([ti, a], i) => {
      const t = T[ti];
      const ledgeR = (t.r + T[ti + 1].r) / 2 + 0.05;
      addMacaron(onWall(ledgeR, a, t.y0 + t.h + 0.12), macShells[i % 3]);
    });

    // Gold sugar pearls + heart / star sprinkles on walls and ledges
    const heartShape = new THREE.Shape();
    heartShape.moveTo(0, -0.1);
    heartShape.bezierCurveTo(-0.22, 0.05, -0.12, 0.22, 0, 0.12);
    heartShape.bezierCurveTo(0.12, 0.22, 0.22, 0.05, 0, -0.1);
    const heartGeo = new THREE.ExtrudeGeometry(heartShape, { depth: 0.04, bevelEnabled: true, bevelSize: 0.015, bevelThickness: 0.015, bevelSegments: 2 });
    heartGeo.center();
    const starShape = new THREE.Shape();
    for (let k = 0; k < 10; k++) {
      const a = (k / 10) * Math.PI * 2 + Math.PI / 2;
      const rr = k % 2 === 0 ? 0.1 : 0.045;
      if (k === 0) starShape.moveTo(Math.cos(a) * rr, Math.sin(a) * rr); else starShape.lineTo(Math.cos(a) * rr, Math.sin(a) * rr);
    }
    const starGeo = new THREE.ExtrudeGeometry(starShape, { depth: 0.03, bevelEnabled: false });
    starGeo.center();
    const sprinkleMats = [rose, sky, gold, blushDeep];
    T.forEach((t, ti) => {
      const count = [34, 28, 16][ti];
      for (let i = 0; i < count; i++) {
        const a = rand() * Math.PI * 2;
        const y = t.y0 + 0.15 + rand() * (t.h - 0.35);
        const kind = rand();
        let m: THREE.Mesh;
        if (kind < 0.4) m = new THREE.Mesh(sphere(0.035, 10), gold);
        else if (kind < 0.7) { m = new THREE.Mesh(heartGeo, sprinkleMats[i % 4]); m.scale.setScalar(0.45); }
        else { m = new THREE.Mesh(starGeo, i % 2 ? gold : sky); m.scale.setScalar(0.5); }
        const p = onWall(t.r, a, y, 0.01);
        m.position.copy(p);
        m.lookAt(p.clone().multiplyScalar(2).setY(y));
        root.add(m);
      }
      // ledge sprinkles
      if (ti < 2) {
        const inner = T[ti + 1].r + 0.08, outer = t.r - 0.08;
        for (let i = 0; i < 26; i++) {
          const a = rand() * Math.PI * 2, rr = inner + rand() * (outer - inner);
          const m = new THREE.Mesh(new THREE.CapsuleGeometry(0.014, 0.05, 2, 6), sprinkleMats[i % 4]);
          m.position.set(Math.cos(a) * rr, t.y0 + t.h + 0.04, Math.sin(a) * rr);
          m.rotation.set(Math.PI / 2, 0, rand() * Math.PI);
          root.add(m);
        }
      }
    });
    // Top surface: hearts + sprinkles around the pedestal
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2 + 0.25;
      const h = new THREE.Mesh(heartGeo, i % 2 ? rose : blushDeep);
      h.scale.setScalar(0.6);
      h.position.set(Math.cos(a) * 0.52, TOP + 0.08, Math.sin(a) * 0.52);
      h.lookAt(Math.cos(a) * 3, TOP + 0.1, Math.sin(a) * 3);
      root.add(h);
    }

    // ---------- Princess figurine on a pedestal ----------
    const ped = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.44, 0.1, 48), white);
    ped.position.y = TOP + 0.05;
    ped.castShadow = true;
    root.add(ped);
    const pedRim = new THREE.Mesh(new THREE.TorusGeometry(0.41, 0.015, 8, 48), gold);
    pedRim.rotation.x = Math.PI / 2;
    pedRim.position.y = TOP + 0.1;
    root.add(pedRim);

    const princess = new THREE.Group();
    // Gown: three flared ruffle tiers
    const ruffle = (rTop: number, rBot: number, h: number, y: number, m: THREE.Material) => {
      const pts: THREE.Vector2[] = [];
      for (let i = 0; i <= 12; i++) {
        const k = i / 12;
        pts.push(new THREE.Vector2(rTop + (rBot - rTop) * Math.pow(k, 1.6), h * (1 - k)));
      }
      const g = new THREE.LatheGeometry(pts, 64);
      // scallop the hem
      const pos = g.attributes.position as THREE.BufferAttribute;
      for (let i = 0; i < pos.count; i++) {
        const x = pos.getX(i), z = pos.getZ(i), yy = pos.getY(i);
        const ang = Math.atan2(z, x);
        const wave = 1 + 0.06 * Math.sin(ang * 14) * (1 - yy / h);
        pos.setX(i, x * wave); pos.setZ(i, z * wave);
      }
      g.computeVertexNormals();
      const mesh = new THREE.Mesh(g, m);
      (mesh.material as THREE.MeshStandardMaterial).side = THREE.DoubleSide;
      mesh.position.y = y;
      mesh.castShadow = true;
      princess.add(mesh);
      const hem = new THREE.Mesh(new THREE.TorusGeometry(rBot * 1.02, 0.014, 6, 64), white);
      hem.rotation.x = Math.PI / 2;
      hem.position.y = y + 0.005;
      princess.add(hem);
    };
    const gownA = std(0xf6c6d4, 0.55); gownA.side = THREE.DoubleSide;
    const gownB = std(0xf9d6df, 0.55); gownB.side = THREE.DoubleSide;
    const skirtCore = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.25, 0.4, 32), gownA);
    skirtCore.position.y = 0.2;
    princess.add(skirtCore);
    ruffle(0.08, 0.3, 0.42, 0.0, gownA);
    ruffle(0.08, 0.235, 0.3, 0.12, gownB);
    ruffle(0.075, 0.165, 0.18, 0.24, gownA);
    // Bodice
    const bodice = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.075, 0.13, 24), blushDeep);
    bodice.position.y = 0.46;
    princess.add(bodice);
    for (let i = 0; i < 7; i++) {
      const p = new THREE.Mesh(sphere(0.008, 6), white);
      p.position.set(-0.04 + i * 0.013, 0.5 - Math.abs(i - 3) * 0.006, 0.065);
      princess.add(p);
    }
    // Puff sleeves + arms + bouquet
    [-1, 1].forEach((s) => {
      const sl = new THREE.Mesh(sphere(0.042, 14), gownB);
      sl.position.set(0.075 * s, 0.51, 0);
      princess.add(sl);
      const arm = new THREE.Mesh(new THREE.CapsuleGeometry(0.016, 0.1, 4, 8), skin);
      arm.position.set(0.06 * s, 0.45, 0.04);
      arm.rotation.set(-0.7, 0, 0.55 * s);
      princess.add(arm);
    });
    const bq = new THREE.Group();
    [[0, 0], [0.022, 0.01], [-0.022, 0.01], [0.012, -0.018], [-0.012, -0.018]].forEach(([x, y], i) => {
      const b = new THREE.Mesh(sphere(0.018, 10), i % 2 ? rose : blushDeep);
      b.position.set(x, y, 0);
      bq.add(b);
    });
    const leaf = new THREE.Mesh(sphere(0.02, 8), std(0x9bb89a, 0.6)); leaf.scale.set(1.6, 0.5, 0.5); leaf.position.set(0, -0.03, -0.005); bq.add(leaf);
    bq.position.set(0, 0.41, 0.095);
    princess.add(bq);
    // Neck + head
    const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.022, 0.04, 12), skin);
    neck.position.y = 0.545;
    princess.add(neck);
    const head = new THREE.Mesh(sphere(0.085, 32), skin);
    head.position.y = 0.625;
    princess.add(head);
    [-1, 1].forEach((s) => {
      const eye = new THREE.Mesh(sphere(0.013, 12), dark);
      eye.scale.set(0.85, 1.15, 0.5);
      eye.position.set(0.03 * s, 0.628, 0.078);
      princess.add(eye);
      const shine = new THREE.Mesh(sphere(0.0045, 6), white);
      shine.position.set(0.033 * s, 0.633, 0.083);
      princess.add(shine);
      const cheek = new THREE.Mesh(sphere(0.012, 10), std(0xf2a7b2, 0.8, { transparent: true, opacity: 0.6 }));
      cheek.scale.set(1.3, 0.8, 0.3);
      cheek.position.set(0.048 * s, 0.605, 0.07);
      princess.add(cheek);
    });
    const mouth = new THREE.Mesh(new THREE.TorusGeometry(0.009, 0.0025, 4, 12, Math.PI), rose);
    mouth.rotation.z = Math.PI;
    mouth.position.set(0, 0.595, 0.083);
    princess.add(mouth);
    // Hair: crown cap, fringe, long back, curls
    const cap = new THREE.Mesh(new THREE.SphereGeometry(0.093, 32, 16, 0, Math.PI * 2, 0, Math.PI * 0.52), hairM);
    cap.position.set(0, 0.632, -0.008);
    cap.rotation.x = -0.25;
    princess.add(cap);
    const back = new THREE.Mesh(new THREE.CapsuleGeometry(0.075, 0.2, 8, 16), hairM);
    back.scale.set(1.25, 1, 0.55);
    back.position.set(0, 0.52, -0.05);
    princess.add(back);
    [-1, 1].forEach((s) => {
      for (let k = 0; k < 6; k++) {
        const c = new THREE.Mesh(sphere(0.03 - k * 0.0015, 12), hairM);
        c.position.set((0.083 + Math.sin(k * 1.4) * 0.012) * s, 0.63 - k * 0.04, -0.01 - k * 0.004);
        princess.add(c);
      }
    });
    // Tiara
    const tiara = new THREE.Group();
    const tRing = new THREE.Mesh(new THREE.TorusGeometry(0.05, 0.006, 6, 32, Math.PI), gold);
    tiara.add(tRing);
    [-0.6, 0, 0.6].forEach((a, i) => {
      const spike = new THREE.Mesh(new THREE.ConeGeometry(0.009, i === 1 ? 0.04 : 0.026, 8), gold);
      spike.position.set(Math.sin(a) * 0.05, Math.cos(a) * 0.05 + 0.012, 0);
      spike.rotation.z = -a;
      tiara.add(spike);
    });
    const gem = new THREE.Mesh(new THREE.OctahedronGeometry(0.012), std(0xe36d9a, 0.15, { metalness: 0.3 }));
    gem.position.set(0, 0.052, 0.006);
    tiara.add(gem);
    tiara.position.set(0, 0.68, 0.035);
    tiara.rotation.x = -0.5;
    princess.add(tiara);

    princess.scale.setScalar(1.45);
    princess.position.y = TOP + 0.1;
    princess.traverse((o) => ((o as THREE.Mesh).castShadow = true));
    root.add(princess);

    // Candles
    const glowTex = glowTexture();
    const candleTex = stripeTexture('#fffaf2', '#8fb4dc');
    const candleMat = new THREE.MeshStandardMaterial({ map: candleTex, roughness: 0.45 });
    const wickMat = new THREE.MeshStandardMaterial({ color: 0x2b2320, roughness: 1 });
    const candles: Candle[] = [];
    const positions: [number, number][] = Array.from({ length: 5 }, (_, k) => {
      const a = -Math.PI / 2 + (k / 5) * Math.PI * 2;
      return [Math.cos(a) * 0.8, Math.sin(a) * 0.8];
    });
    positions.forEach(([x, z]) => {
      const hgt = 0.62;
      const c = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, hgt, 24), candleMat);
      c.position.set(x, TOP + hgt / 2, z);
      c.castShadow = true;
      root.add(c);
      const topY = TOP + hgt;
      const wick = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.01, 0.08, 8), wickMat);
      wick.position.set(x, topY + 0.04, z);
      root.add(wick);

      const mat = new THREE.ShaderMaterial({
        uniforms: { uTime: { value: 0 }, uSeed: { value: Math.random() }, uLife: { value: 1 } },
        vertexShader: flameVertex,
        fragmentShader: flameFragment,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      });
      const flame = new THREE.Mesh(new THREE.SphereGeometry(0.5, 32, 32).translate(0, 0.5, 0), mat);
      flame.scale.set(0.15, 0.36, 0.15);
      flame.position.set(x, topY + 0.03, z);
      root.add(flame);

      const glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
      glow.scale.set(0.8, 0.8, 1);
      glow.position.set(x, topY + 0.18, z);
      root.add(glow);

      const light = new THREE.PointLight(0xffb066, 0.5, 3.0, 2);
      light.position.set(x, topY + 0.22, z);
      root.add(light);

      candles.push({ flame, mat, glow, light, life: 1, target: 1, tip: new THREE.Vector3(x, topY + 0.1, z) });
    });

    // Smoke particles
    const smokeTex = smokeTexture();
    type Puff = { s: THREE.Sprite; v: THREE.Vector3; age: number; max: number };
    const puffs: Puff[] = [];
    const emitSmoke = (from: THREE.Vector3) => {
      for (let i = 0; i < 14; i++) {
        const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: smokeTex, transparent: true, depthWrite: false, opacity: 0 }));
        s.position.copy(from);
        s.scale.setScalar(0.12);
        root.add(s);
        puffs.push({ s, v: new THREE.Vector3((Math.random() - 0.5) * 0.12, 0.35 + Math.random() * 0.25, (Math.random() - 0.5) * 0.12), age: -i * 0.07, max: 2.2 + Math.random() });
      }
    };

    const blow = () => {
      candles.forEach((c, i) => {
        if (c.target === 0) return;
        c.target = 0;
        window.setTimeout(() => emitSmoke(c.tip), 120 + i * 60);
      });
      setOut(true);
    };
    const relight = () => {
      candles.forEach((c) => (c.target = 1));
      setOut(false);
    };
    api.current = { blow, relight };

    // Swipe detection (horizontal on touch so vertical scroll still works; any drag with a mouse)
    let sx = 0, sy = 0, tracking = false;
    const el = renderer.domElement;
    el.style.touchAction = 'pan-y';
    const down = (e: PointerEvent) => { tracking = true; sx = e.clientX; sy = e.clientY; };
    const move = (e: PointerEvent) => {
      if (!tracking) return;
      const dx = e.clientX - sx, dy = e.clientY - sy;
      if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 0.8) { tracking = false; blow(); }
    };
    const up = () => { tracking = false; };
    el.addEventListener('pointerdown', down);
    el.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
    el.addEventListener('pointercancel', up);

    // Resize
    const resize = () => {
      const w = mount.clientWidth, h = mount.clientHeight;
      renderer.setSize(w, h, false);
      el.style.width = '100%'; el.style.height = '100%';
      camera.aspect = w / h;
      camera.position.z = w < 500 ? 12.2 : 9.6;
      camera.updateProjectionMatrix();
    };
    const ro = new ResizeObserver(resize);
    ro.observe(mount);
    resize();

    // Only render while on screen
    let visible = false;
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; }, { threshold: 0.01 });
    io.observe(mount);

    const clock = new THREE.Clock();
    let raf = 0;
    const tick = () => {
      raf = requestAnimationFrame(tick);
      if (!visible) { clock.getDelta(); return; }
      const dt = Math.min(clock.getDelta(), 0.05);
      const t = clock.elapsedTime;
      if (!reduce) root.rotation.y += dt * 0.18;
      candles.forEach((c, i) => {
        const speed = c.target === 0 ? 7 : 2.5;
        c.life += (c.target - c.life) * Math.min(1, dt * speed);
        c.mat.uniforms.uTime.value = t;
        c.mat.uniforms.uLife.value = c.life;
        const flick = 0.85 + Math.sin(t * 13 + i) * 0.06 + Math.sin(t * 7.3 + i * 2) * 0.05;
        c.light.intensity = 0.6 * c.life * flick;
        c.glow.material.opacity = c.life * flick;
        const gs = 0.9 * (0.6 + 0.4 * c.life) * flick;
        c.glow.scale.set(gs, gs, 1);
        c.flame.visible = c.life > 0.02;
      });
      for (let i = puffs.length - 1; i >= 0; i--) {
        const p = puffs[i];
        p.age += dt;
        if (p.age < 0) continue;
        p.s.position.addScaledVector(p.v, dt);
        p.s.position.x += Math.sin(p.age * 3 + i) * 0.003;
        const k = p.age / p.max;
        p.s.scale.setScalar(0.12 + k * 0.6);
        (p.s.material as THREE.SpriteMaterial).opacity = Math.sin(Math.min(1, k) * Math.PI) * 0.5;
        if (k >= 1) { root.remove(p.s); p.s.material.dispose(); puffs.splice(i, 1); }
      }
      renderer.render(scene, camera);
    };
    tick();

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      el.removeEventListener('pointerdown', down);
      el.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
      el.removeEventListener('pointercancel', up);
      scene.traverse((o) => {
        const m = o as THREE.Mesh;
        if (m.geometry) m.geometry.dispose();
        const mat = m.material as THREE.Material | THREE.Material[] | undefined;
        if (Array.isArray(mat)) mat.forEach((x) => x.dispose()); else mat?.dispose();
      });
      glowTex.dispose(); smokeTex.dispose(); candleTex.dispose();
      renderer.dispose();
      mount.removeChild(el);
    };
  }, []);

  return (
    <div className="relative mx-auto max-w-2xl text-center">
      <p className="font-italic-serif text-2xl sm:text-3xl text-[#1C1B19]">{title}</p>
      <div ref={mountRef} className="relative mt-2 h-[440px] sm:h-[540px] w-full cursor-grab active:cursor-grabbing select-none" aria-label="Kue anniversary 3D. Swipe untuk meniup lilin." role="img" />
      <div className="min-h-[5.5rem]">
        <AnimatePresence mode="wait">
          {!out ? (
            <motion.p
              key="hint"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-[11px] tracking-[0.28em] uppercase text-[#6E6A64]"
            >
              <span aria-hidden="true">←</span> Swipe kuenya buat tiup lilin <span aria-hidden="true">→</span>
            </motion.p>
          ) : (
            <motion.div
              key="done"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
            >
              <p className="font-serif text-3xl sm:text-4xl text-[#1C1B19]">
                Happy <span className="text-grad font-italic-serif">1st</span> Anniversary.
              </p>
              <button
                type="button"
                onClick={() => api.current?.relight()}
                className="mt-4 text-[11px] tracking-[0.28em] uppercase text-[#5B8FC7] underline underline-offset-4 cursor-pointer"
              >
                Nyalakan lagi
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
