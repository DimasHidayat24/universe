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
    camera.position.set(0, 4.1, 9.2);
    camera.lookAt(0, 1.35, 0);

    // Lights: soft daylight + warm candle glow
    const hemi = new THREE.HemisphereLight(0xf2f6fb, 0xd9c7b5, 1.15);
    scene.add(hemi);
    const key = new THREE.DirectionalLight(0xffffff, 1.6);
    key.position.set(4, 7, 5);
    key.castShadow = true;
    key.shadow.mapSize.set(1024, 1024);
    key.shadow.camera.left = -4; key.shadow.camera.right = 4;
    key.shadow.camera.top = 4; key.shadow.camera.bottom = -4;
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
    const plate = new THREE.Mesh(new THREE.CylinderGeometry(2.35, 2.2, 0.12, 96), plateMat);
    plate.position.y = 0.36;
    plate.castShadow = plate.receiveShadow = true;
    root.add(plate);
    const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.8, 0.32, 48), plateMat);
    stem.position.y = 0.16;
    stem.castShadow = true;
    root.add(stem);

    const sponge = new THREE.MeshStandardMaterial({ color: 0xfaf3ea, roughness: 0.55 });
    const blue = new THREE.MeshStandardMaterial({ color: 0xbcd4ec, roughness: 0.5 });
    const cream = new THREE.MeshStandardMaterial({ color: 0xfffbf5, roughness: 0.35 });
    const rose = new THREE.MeshStandardMaterial({ color: 0xd98c7a, roughness: 0.4 });

    // Bottom tier
    const t1 = new THREE.Mesh(new THREE.CylinderGeometry(1.8, 1.8, 1.0, 96), blue);
    t1.position.y = 0.42 + 0.5;
    t1.castShadow = t1.receiveShadow = true;
    root.add(t1);
    // Top tier
    const t2 = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.2, 0.8, 96), sponge);
    t2.position.y = 1.42 + 0.4;
    t2.castShadow = t2.receiveShadow = true;
    root.add(t2);

    // Frosting caps + drips + piped pearls
    const addTierTrim = (r: number, topY: number, bottomY: number, dripMat: THREE.Material, pearlMat: THREE.Material) => {
      const cap = new THREE.Mesh(new THREE.CylinderGeometry(r + 0.02, r + 0.02, 0.06, 96), dripMat);
      cap.position.y = topY;
      root.add(cap);
      const n = Math.round(r * 16);
      for (let i = 0; i < n; i++) {
        const a = (i / n) * Math.PI * 2;
        const len = 0.15 + ((Math.sin(i * 12.9898) * 43758.5453) % 1 + 1) % 1 * 0.3;
        const drip = new THREE.Mesh(new THREE.CapsuleGeometry(0.07, len, 4, 10), dripMat);
        drip.position.set(Math.cos(a) * (r + 0.015), topY - len / 2 - 0.02, Math.sin(a) * (r + 0.015));
        drip.castShadow = true;
        root.add(drip);
      }
      // piped pearls around the base
      const m = Math.round(r * 22);
      for (let i = 0; i < m; i++) {
        const a = (i / m) * Math.PI * 2;
        const pearl = new THREE.Mesh(new THREE.SphereGeometry(0.085, 16, 12), pearlMat);
        pearl.position.set(Math.cos(a) * (r + 0.02), bottomY + 0.07, Math.sin(a) * (r + 0.02));
        root.add(pearl);
      }
    };
    addTierTrim(1.8, 1.42, 0.42, cream, cream);
    addTierTrim(1.2, 2.22, 1.42, cream, rose);

    // Rose berries + tiny hearts on the bottom tier's top ledge
    const heartShape = new THREE.Shape();
    heartShape.moveTo(0, -0.1);
    heartShape.bezierCurveTo(-0.22, 0.05, -0.12, 0.22, 0, 0.12);
    heartShape.bezierCurveTo(0.12, 0.22, 0.22, 0.05, 0, -0.1);
    const heartGeo = new THREE.ExtrudeGeometry(heartShape, { depth: 0.05, bevelEnabled: true, bevelSize: 0.02, bevelThickness: 0.02, bevelSegments: 3 });
    heartGeo.center();
    for (let i = 0; i < 10; i++) {
      const a = (i / 10) * Math.PI * 2 + 0.3;
      if (i % 2 === 0) {
        const berry = new THREE.Mesh(new THREE.SphereGeometry(0.11, 20, 16), rose);
        berry.position.set(Math.cos(a) * 1.5, 1.5, Math.sin(a) * 1.5);
        berry.castShadow = true;
        root.add(berry);
      } else {
        const h = new THREE.Mesh(heartGeo, rose);
        h.scale.setScalar(1.4);
        h.position.set(Math.cos(a) * 1.5, 1.58, Math.sin(a) * 1.5);
        h.lookAt(Math.cos(a) * 4, 1.58, Math.sin(a) * 4);
        root.add(h);
      }
    }

    // Candles
    const glowTex = glowTexture();
    const candleTex = stripeTexture('#fffaf2', '#8fb4dc');
    const candleMat = new THREE.MeshStandardMaterial({ map: candleTex, roughness: 0.45 });
    const wickMat = new THREE.MeshStandardMaterial({ color: 0x2b2320, roughness: 1 });
    const candles: Candle[] = [];
    const positions: [number, number][] = [[0, 0], [0.62, 0.3], [-0.62, 0.3], [0.38, -0.55], [-0.38, -0.55]];
    positions.forEach(([x, z], idx) => {
      const hgt = idx === 0 ? 1.0 : 0.78;
      const c = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.075, hgt, 24), candleMat);
      c.position.set(x, 2.22 + hgt / 2, z);
      c.castShadow = true;
      root.add(c);
      const topY = 2.22 + hgt;
      const wick = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.1, 8), wickMat);
      wick.position.set(x, topY + 0.05, z);
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
      flame.scale.set(0.17, 0.42, 0.17);
      flame.position.set(x, topY + 0.04, z);
      root.add(flame);

      const glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
      glow.scale.set(0.9, 0.9, 1);
      glow.position.set(x, topY + 0.2, z);
      root.add(glow);

      const light = new THREE.PointLight(0xffb066, 0.6, 3.5, 2);
      light.position.set(x, topY + 0.25, z);
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
      camera.position.z = w < 500 ? 11 : 8.2;
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
      <div ref={mountRef} className="relative mt-2 h-[380px] sm:h-[460px] w-full cursor-grab active:cursor-grabbing select-none" aria-label="Kue anniversary 3D. Swipe untuk meniup lilin." role="img" />
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
