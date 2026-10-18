import React, { useEffect, useRef, useState } from 'react';
import princessUrl from '../assets/princess.webp';
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
    camera.position.set(0, 3.3, 11.2);
    camera.lookAt(0, 2.25, 0);

    // Lights: soft daylight + warm candle glow
    const hemi = new THREE.HemisphereLight(0xf2f6fb, 0xd9c7b5, 1.15);
    scene.add(hemi);
    const key = new THREE.DirectionalLight(0xffffff, 1.6);
    key.position.set(4, 7, 5);
    key.castShadow = true;
    key.shadow.mapSize.set(1024, 1024);
    key.shadow.camera.left = -4; key.shadow.camera.right = 4;
    key.shadow.camera.top = 6; key.shadow.camera.bottom = -4;
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

    // ---------- Materials ----------
    const std = (color: number, roughness = 0.45, extra: Partial<THREE.MeshStandardMaterialParameters> = {}) =>
      new THREE.MeshStandardMaterial({ color, roughness, ...extra });
    const plateMat = new THREE.MeshPhysicalMaterial({ color: 0xffffff, roughness: 0.2, clearcoat: 1, clearcoatRoughness: 0.15 });
    const skyPale = std(0xc3d8ee, 0.55);
    const blush = std(0xf4c3d0, 0.55);
    const creamT = std(0xfaf1e2, 0.55);
    const icing = std(0xfffcf7, 0.32);
    const dripBlue = std(0xa9c6e6, 0.35);
    const dripPink = std(0xf2b9c9, 0.35);
    const roseA = std(0xdf9f97, 0.55);
    const roseB = std(0xd68b84, 0.55);
    const gold = std(0xe2c591, 0.3, { metalness: 0.3, emissive: 0x3a2a10, emissiveIntensity: 0.2 });
    const white = std(0xffffff, 0.3);
    const skin = std(0xfbe2d4, 0.6);
    const hairM = std(0xebc777, 0.45);
    const hairD = std(0xd9ad5c, 0.5);
    const dark = std(0x4a3226, 0.4);
    const rand = (() => { let s = 11; return () => ((s = (s * 16807) % 2147483647) / 2147483647); })();
    const sphere = (r: number, seg = 16) => new THREE.SphereGeometry(r, seg, Math.max(8, Math.round(seg * 0.75)));
    const onWall = (r: number, a: number, y: number, out = 0) => new THREE.Vector3(Math.cos(a) * (r + out), y, Math.sin(a) * (r + out));
    const faceOut = (o: THREE.Object3D) => { const p = o.position; o.lookAt(p.x * 3, p.y, p.z * 3); };

    // ---------- Cake stand ----------
    const plate = new THREE.Mesh(new THREE.CylinderGeometry(1.95, 1.9, 0.08, 96), plateMat);
    plate.position.y = 0.66;
    plate.castShadow = plate.receiveShadow = true;
    root.add(plate);
    const plateRim = new THREE.Mesh(new THREE.TorusGeometry(1.94, 0.045, 12, 96), plateMat);
    plateRim.rotation.x = Math.PI / 2; plateRim.position.y = 0.67; root.add(plateRim);
    const stemPts = [[0.9, 0], [0.9, 0.05], [0.55, 0.12], [0.3, 0.28], [0.26, 0.5], [0.45, 0.62]].map(([x, y]) => new THREE.Vector2(x, y));
    const stem = new THREE.Mesh(new THREE.LatheGeometry(stemPts, 64), plateMat);
    stem.castShadow = true;
    root.add(stem);

    // ---------- Tiers ----------
    const BASE = 0.7;
    const T = [
      { r: 1.55, y0: BASE, h: 0.95, m: skyPale },
      { r: 1.27, y0: BASE + 0.95, h: 0.85, m: blush },
      { r: 1.0, y0: BASE + 1.8, h: 0.88, m: creamT },
    ];
    T.forEach((t) => {
      const mesh = new THREE.Mesh(new THREE.CylinderGeometry(t.r, t.r, t.h, 96), t.m);
      mesh.position.y = t.y0 + t.h / 2;
      mesh.castShadow = mesh.receiveShadow = true;
      root.add(mesh);
    });
    const TOP = T[2].y0 + T[2].h;

    // Rounded frosting lip + thin, irregular drips with a bulb at the end
    const dripRing = (r: number, topY: number, capMat: THREE.Material, mats: THREE.Material[], maxLen: number) => {
      const cap = new THREE.Mesh(new THREE.CylinderGeometry(r + 0.015, r + 0.015, 0.05, 96), capMat);
      cap.position.y = topY - 0.01; root.add(cap);
      const lip = new THREE.Mesh(new THREE.TorusGeometry(r, 0.04, 10, 96), capMat);
      lip.rotation.x = Math.PI / 2; lip.position.y = topY - 0.03; root.add(lip);
      const n = Math.round(r * 24);
      for (let i = 0; i < n; i++) {
        const a = (i / n) * Math.PI * 2 + rand() * 0.05;
        const len = 0.06 + Math.pow(rand(), 1.4) * maxLen;
        const w = 0.032 + rand() * 0.016;
        const m = mats[Math.floor(rand() * mats.length)];
        const d = new THREE.Mesh(new THREE.CapsuleGeometry(w, len, 4, 8), m);
        d.position.copy(onWall(r, a, topY - 0.03 - len / 2, 0.012));
        d.scale.z = 0.7; faceOut(d);
        root.add(d);
        const bulb = new THREE.Mesh(sphere(w * 1.1, 10), m);
        bulb.position.copy(onWall(r, a, topY - 0.03 - len, 0.014));
        root.add(bulb);
      }
    };
    dripRing(T[0].r, T[0].y0 + T[0].h, icing, [icing], 0.38);
    dripRing(T[2].r, TOP, icing, [dripBlue, dripPink, icing], 0.34);
    // pink tier: smooth lip only
    const lip1 = new THREE.Mesh(new THREE.TorusGeometry(T[1].r, 0.035, 10, 96), blush);
    lip1.rotation.x = Math.PI / 2; lip1.position.y = T[1].y0 + T[1].h - 0.02; root.add(lip1);

    // Pearl borders
    const pearls = (r: number, y: number, m: THREE.Material, size: number) => {
      const n = Math.round((Math.PI * 2 * r) / (size * 2.15));
      for (let i = 0; i < n; i++) {
        const p = new THREE.Mesh(sphere(size, 14), m);
        p.position.copy(onWall(r, (i / n) * Math.PI * 2, y + size * 0.9, 0.01));
        root.add(p);
      }
    };
    pearls(T[0].r, T[0].y0, white, 0.06);
    pearls(T[1].r, T[1].y0, white, 0.045);
    pearls(T[2].r, T[2].y0, white, 0.04);

    // Gold ribbons + bow on the pink tier
    const band = (r: number, y: number, h: number) => {
      const b = new THREE.Mesh(new THREE.CylinderGeometry(r + 0.01, r + 0.01, h, 96, 1, true), gold);
      b.position.y = y; root.add(b);
    };
    band(T[1].r, T[1].y0 + 0.36, 0.07);
    band(T[2].r, T[2].y0 + 0.16, 0.06);
    const bow = new THREE.Group();
    const loopGeo = new THREE.TorusGeometry(0.075, 0.022, 10, 24);
    [-1, 1].forEach((s) => {
      const l = new THREE.Mesh(loopGeo, gold); l.scale.set(1.4, 0.7, 0.5); l.position.x = 0.1 * s; bow.add(l);
      const tail = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.13, 0.015), gold);
      tail.position.set(0.035 * s, -0.08, 0); tail.rotation.z = 0.3 * s; bow.add(tail);
    });
    const knot = new THREE.Mesh(sphere(0.035), gold); knot.scale.set(1, 0.9, 0.6); bow.add(knot);
    bow.position.set(0, T[1].y0 + 0.36, T[1].r + 0.03);
    root.add(bow);

    // Big sugar roses (cupped petals spiralling round a bud)
    const petalGeo = new THREE.SphereGeometry(0.05, 14, 10, 0, Math.PI * 2, 0, Math.PI * 0.55);
    const addRose = (pos: THREE.Vector3, s: number, m: THREE.Material) => {
      const g = new THREE.Group();
      const bud = new THREE.Mesh(sphere(0.03, 12), m); bud.scale.set(1, 1, 1.3); bud.position.z = 0.04; g.add(bud);
      const rings: [number, number, number, number][] = [[4, 0.028, 0.7, 0.035], [6, 0.055, 0.95, 0.02], [8, 0.085, 1.15, 0.0], [10, 0.11, 1.25, -0.02]];
      rings.forEach(([n, rad, sc, z], ring) => {
        for (let k = 0; k < n; k++) {
          const a = (k / n) * Math.PI * 2 + ring * 0.5;
          const pt = new THREE.Mesh(petalGeo, m);
          pt.scale.set(sc, sc, sc * 0.55);
          pt.position.set(Math.cos(a) * rad, Math.sin(a) * rad, z);
          pt.rotation.set(-Math.sin(a) * (0.9 + ring * 0.25), Math.cos(a) * (0.9 + ring * 0.25), 0);
          pt.rotateX(Math.PI / 2);
          g.add(pt);
        }
      });
      g.scale.setScalar(s);
      g.position.copy(pos);
      faceOut(g);
      g.traverse((o) => ((o as THREE.Mesh).castShadow = true));
      root.add(g);
    };
    const addBlossom = (pos: THREE.Vector3, s = 1) => {
      const g = new THREE.Group();
      for (let k = 0; k < 5; k++) {
        const a = (k / 5) * Math.PI * 2;
        const p = new THREE.Mesh(sphere(0.03 * s, 10), white);
        p.scale.set(1, 1, 0.4);
        p.position.set(Math.cos(a) * 0.035 * s, Math.sin(a) * 0.035 * s, 0);
        g.add(p);
      }
      const c = new THREE.Mesh(sphere(0.016 * s, 8), gold); c.position.z = 0.01; g.add(c);
      g.position.copy(pos); faceOut(g); root.add(g);
    };
    const leafGeo = sphere(0.05, 10);
    const leafMat = std(0xa9bfa0, 0.6);
    const addLeaf = (pos: THREE.Vector3, rot: number) => {
      const l = new THREE.Mesh(leafGeo, leafMat); l.scale.set(1.6, 0.6, 0.35);
      l.position.copy(pos); faceOut(l); l.rotateZ(rot); root.add(l);
    };
    const front = Math.PI / 2;

    // Macarons leaning on ledges
    const addMacaron = (pos: THREE.Vector3, shell: THREE.Material) => {
      const g = new THREE.Group();
      [-1, 1].forEach((s) => {
        const half = new THREE.Mesh(sphere(0.15, 24), shell);
        half.scale.set(1, 0.45, 1); half.position.y = 0.045 * s; g.add(half);
      });
      const fill = new THREE.Mesh(new THREE.CylinderGeometry(0.135, 0.135, 0.045, 28), icing); g.add(fill);
      g.position.copy(pos); faceOut(g); g.rotateX(Math.PI / 2 - 0.25);
      g.traverse((o) => ((o as THREE.Mesh).castShadow = true));
      root.add(g);
    };
    const macBlue = std(0xa9c6e6, 0.5), macPink = std(0xf2b9c9, 0.5);
    addMacaron(onWall(T[1].r + 0.1, front - 1.05, T[0].y0 + T[0].h + 0.16), macBlue);
    addMacaron(onWall(T[1].r + 0.12, front + 1.25, T[0].y0 + T[0].h + 0.16), macPink);
    addMacaron(onWall(T[2].r + 0.12, front - 1.2, T[1].y0 + T[1].h + 0.16), macPink);
    addMacaron(onWall(T[2].r + 0.12, front + 1.1, T[1].y0 + T[1].h + 0.16), macBlue);
    addMacaron(onWall(T[1].r + 0.1, front + 3.4, T[0].y0 + T[0].h + 0.16), macPink);
    addMacaron(onWall(T[2].r + 0.12, front + 3.6, T[1].y0 + T[1].h + 0.16), macBlue);

    // A light scatter of gold dragées + tiny hearts
    const heartShape = new THREE.Shape();
    heartShape.moveTo(0, -0.1);
    heartShape.bezierCurveTo(-0.22, 0.05, -0.12, 0.22, 0, 0.12);
    heartShape.bezierCurveTo(0.12, 0.22, 0.22, 0.05, 0, -0.1);
    const heartGeo = new THREE.ExtrudeGeometry(heartShape, { depth: 0.04, bevelEnabled: true, bevelSize: 0.015, bevelThickness: 0.015, bevelSegments: 2 });
    heartGeo.center();
    T.forEach((t, ti) => {
      const count = [14, 12, 10][ti];
      for (let i = 0; i < count; i++) {
        const a = rand() * Math.PI * 2;
        const y = t.y0 + 0.18 + rand() * (t.h - 0.45);
        const m = i % 3 === 0 ? new THREE.Mesh(heartGeo, roseA) : new THREE.Mesh(sphere(0.03, 10), gold);
        if (i % 3 === 0) m.scale.setScalar(0.38);
        m.position.copy(onWall(t.r, a, y, 0.01)); faceOut(m); root.add(m);
      }
      if (ti < 2) {
        const inner = T[ti + 1].r + 0.08, outer = t.r - 0.1;
        for (let i = 0; i < 12; i++) {
          const a = rand() * Math.PI * 2, rr = inner + rand() * (outer - inner);
          const m = new THREE.Mesh(sphere(0.028, 10), i % 2 ? gold : white);
          m.position.set(Math.cos(a) * rr, t.y0 + t.h + 0.02, Math.sin(a) * rr); root.add(m);
        }
      }
    });
    for (let i = 0; i < 4; i++) {
      const a = front + (i - 1.5) * 0.55;
      const h = new THREE.Mesh(heartGeo, i % 2 ? roseA : dripPink);
      h.scale.setScalar(0.55);
      h.position.set(Math.cos(a) * 0.55, TOP + 0.08, Math.sin(a) * 0.55);
      faceOut(h); root.add(h);
    }

    // ---------- Mini stand + princess (image cutout from the approved concept) ----------
    const PRINCESS_ASPECT = 0.7111;
    const STAND_TOP = TOP + 0.3;
    const mini = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.48, 0.05, 64), plateMat);
    mini.position.y = STAND_TOP - 0.025; mini.castShadow = true; root.add(mini);
    const miniRim = new THREE.Mesh(new THREE.TorusGeometry(0.5, 0.025, 8, 64), plateMat);
    miniRim.rotation.x = Math.PI / 2; miniRim.position.y = STAND_TOP - 0.02; root.add(miniRim);
    const miniStem = new THREE.Mesh(new THREE.LatheGeometry([[0.25, 0], [0.12, 0.06], [0.07, 0.15], [0.12, 0.25]].map(([x, y]) => new THREE.Vector2(x, y)), 48), plateMat);
    miniStem.position.y = TOP; root.add(miniStem);

    const princessTex = new THREE.TextureLoader().load(princessUrl);
    princessTex.colorSpace = THREE.SRGBColorSpace;
    princessTex.anisotropy = 8;
    const princess = new THREE.Sprite(new THREE.SpriteMaterial({ map: princessTex, alphaTest: 0.35, toneMapped: false }));
    princess.center.set(0.5, 0.02);
    const PH = 1.45;
    princess.scale.set(PH * PRINCESS_ASPECT, PH, 1);
    princess.position.set(0, STAND_TOP, 0.05);
    root.add(princess);

    // Candles ring around the mini stand
    const glowTex = glowTexture();
    const candleTex = stripeTexture('#fffaf2', '#8fb4dc');
    const candleMat = new THREE.MeshStandardMaterial({ map: candleTex, roughness: 0.45 });
    const wickMat = new THREE.MeshStandardMaterial({ color: 0x2b2320, roughness: 1 });
    const candles: Candle[] = [];
    const positions: [number, number][] = Array.from({ length: 5 }, (_, k) => {
      const a = -Math.PI / 2 + (k / 5) * Math.PI * 2;
      return [Math.cos(a) * 0.78, Math.sin(a) * 0.78];
    });
    positions.forEach(([x, z]) => {
      const hgt = 0.8;
      const c = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, hgt, 24), candleMat);
      c.position.set(x, TOP + hgt / 2, z);
      c.castShadow = true;
      root.add(c);
      const topY = TOP + hgt;
      const wick = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.07, 8), wickMat);
      wick.position.set(x, topY + 0.035, z);
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
      flame.scale.set(0.13, 0.32, 0.13);
      flame.position.set(x, topY + 0.03, z);
      root.add(flame);

      const glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
      glow.scale.set(0.7, 0.7, 1);
      glow.position.set(x, topY + 0.16, z);
      root.add(glow);

      const light = new THREE.PointLight(0xffb066, 0.45, 3.0, 2);
      light.position.set(x, topY + 0.2, z);
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
      camera.position.z = w < 500 ? 14 : 11.2;
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
      <div ref={mountRef} className="relative mt-2 h-[520px] sm:h-[620px] w-full cursor-grab active:cursor-grabbing select-none" aria-label="Kue anniversary 3D. Swipe untuk meniup lilin." role="img" />
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
