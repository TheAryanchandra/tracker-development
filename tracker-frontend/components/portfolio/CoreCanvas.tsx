'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';

/**
 * CoreCanvas — the ambient, scroll-choreographed 3D scene behind the portfolio.
 *  • A faceted "ice core" crystal (custom fresnel shader) with a wire shell.
 *  • ~2.6k particles that morph into a new formation for every chapter.
 *  • Particles are repelled by the cursor; clicking empty space fires a shockwave.
 *  • Reacts to the copilot (`copilot:state`) so the core "thinks" while the AI answers.
 */

interface Props {
  chapter: number;
  progress: number; // 0..1 page scroll
}

const COUNT_DESKTOP = 2600;
const COUNT_MOBILE = 1300;

function fibSphere(i: number, n: number, r: number) {
  const y = 1 - (i / (n - 1)) * 2;
  const rad = Math.sqrt(1 - y * y);
  const t = i * Math.PI * (3 - Math.sqrt(5));
  return [Math.cos(t) * rad * r, y * r, Math.sin(t) * rad * r];
}

function buildFormations(n: number): Float32Array[] {
  const rnd = (a = 1) => (Math.random() - 0.5) * a;
  const f: Float32Array[] = [];

  // 0 — hero: crystalline shell + dust
  const a = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) {
    const shell = i % 5 !== 0;
    const r = shell ? 2.9 + Math.random() * 0.35 : 4 + Math.random() * 5;
    const [x, y, z] = fibSphere(i, n, r);
    a.set([x + rnd(0.08), y + rnd(0.08), z + rnd(0.08)], i * 3);
  }
  f.push(a);

  // 1 — experience: double helix timeline
  const b = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) {
    const t = (i / n) * Math.PI * 10;
    const strand = i % 2 ? Math.PI : 0;
    const y = (i / n) * 12 - 6;
    const r = 1.8 + rnd(0.25);
    b.set([Math.cos(t + strand) * r, y, Math.sin(t + strand) * r], i * 3);
  }
  f.push(b);

  // 2 — system lab: galactic disk with arms (calm backdrop)
  const c = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) {
    const arm = i % 3;
    const d = Math.pow(Math.random(), 0.7) * 8;
    const ang = d * 0.7 + (arm * Math.PI * 2) / 3 + rnd(0.5);
    c.set([Math.cos(ang) * d, rnd(0.35) * (1 - d / 9), Math.sin(ang) * d], i * 3);
  }
  f.push(c);

  // 3 — work: four orbital rings (one per flagship project)
  const d = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) {
    const ring = i % 4;
    const t = Math.random() * Math.PI * 2;
    const r = 2.2 + ring * 0.9 + rnd(0.12);
    const tilt = ring * 0.45 - 0.6;
    const x = Math.cos(t) * r;
    const z = Math.sin(t) * r;
    d.set([x, z * Math.sin(tilt) + rnd(0.06), z * Math.cos(tilt)], i * 3);
  }
  f.push(d);

  // 4 — stack: structured lattice cube
  const e = new Float32Array(n * 3);
  const side = Math.ceil(Math.cbrt(n));
  for (let i = 0; i < n; i++) {
    const x = i % side;
    const y = Math.floor(i / side) % side;
    const z = Math.floor(i / (side * side));
    const s = 4.6 / side;
    e.set([(x - side / 2) * s, (y - side / 2) * s, (z - side / 2) * s], i * 3);
  }
  f.push(e);

  // 5 — terminal: wave plane
  const g = new Float32Array(n * 3);
  const cols = Math.ceil(Math.sqrt(n));
  for (let i = 0; i < n; i++) {
    const x = ((i % cols) / cols - 0.5) * 16;
    const z = (Math.floor(i / cols) / cols - 0.5) * 16;
    g.set([x, -2 + Math.sin(x * 0.6) * Math.cos(z * 0.6) * 0.6, z], i * 3);
  }
  f.push(g);

  // 6 — contact: converge into a tight bright sphere + far starfield
  const h = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) {
    const near = i % 3 === 0;
    const [x, y, z] = fibSphere(i, n, near ? 1.9 : 9 + Math.random() * 6);
    h.set([x, y, z], i * 3);
  }
  f.push(h);
  return f;
}

const CORE_VERT = /* glsl */ `
  uniform float uTime;
  uniform float uPulse;
  varying vec3 vPos;
  varying vec3 vWorld;
  varying vec3 vNormalW;
  void main() {
    vec3 p = position;
    float wob = sin(p.y * 3.0 + uTime * 1.3) * 0.03 + sin(p.x * 4.0 - uTime) * 0.02;
    p += normal * (wob + uPulse * 0.18);
    vPos = p;
    vec4 w = modelMatrix * vec4(p, 1.0);
    vWorld = w.xyz;
    vNormalW = normalize(mat3(modelMatrix) * normal);
    gl_Position = projectionMatrix * viewMatrix * w;
  }
`;

const CORE_FRAG = /* glsl */ `
  uniform float uTime;
  uniform float uThink;
  uniform vec3 uColA;
  uniform vec3 uColB;
  varying vec3 vPos;
  varying vec3 vWorld;
  varying vec3 vNormalW;
  void main() {
    // faceted normal from screen-space derivatives
    vec3 fn = normalize(cross(dFdx(vWorld), dFdy(vWorld)));
    vec3 V = normalize(cameraPosition - vWorld);
    float fres = pow(1.0 - abs(dot(fn, V)), 2.4);
    vec3 L = normalize(vec3(0.6, 0.8, 0.5));
    float diff = max(dot(fn, L), 0.0);
    float spec = pow(max(dot(reflect(-L, fn), V), 0.0), 48.0);
    float bands = 0.5 + 0.5 * sin(vPos.y * 6.0 + uTime * (1.0 + uThink * 5.0));
    vec3 base = mix(vec3(0.02, 0.05, 0.09), uColA * 0.35, diff * 0.8);
    vec3 col = base + mix(uColA, uColB, bands) * fres * (1.1 + uThink * 0.9) + spec * 0.9;
    col += uColB * uThink * 0.12 * bands;
    gl_FragColor = vec4(col, 0.92);
  }
`;

const PTS_VERT = /* glsl */ `
  attribute float aSeed;
  uniform float uTime;
  uniform float uSize;
  varying float vAlpha;
  varying float vSeed;
  void main() {
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    float tw = 0.65 + 0.35 * sin(uTime * 2.0 + aSeed * 40.0);
    gl_PointSize = uSize * tw * (30.0 / -mv.z);
    vAlpha = smoothstep(26.0, 4.0, -mv.z) * tw;
    vSeed = aSeed;
    gl_Position = projectionMatrix * mv;
  }
`;

const PTS_FRAG = /* glsl */ `
  uniform vec3 uColA;
  uniform vec3 uColB;
  varying float vAlpha;
  varying float vSeed;
  void main() {
    vec2 c = gl_PointCoord - 0.5;
    float d = length(c);
    if (d > 0.5) discard;
    float glow = smoothstep(0.5, 0.0, d);
    vec3 col = mix(uColA, uColB, step(0.82, vSeed));
    gl_FragColor = vec4(col, glow * vAlpha * 0.9);
  }
`;

// Where the core sits & how big, per chapter (x, y, scale)
const CORE_LAYOUT: [number, number, number][] = [
  [2.6, 0.2, 1.0], // hero
  [-3.6, 0.0, 0.55], // experience
  [0, 3.2, 0.35], // lab
  [3.4, -0.4, 0.6], // work
  [-3.2, 0.6, 0.55], // stack
  [3.6, 1.2, 0.45], // terminal
  [0, 0.2, 0.9], // contact
];

export default function CoreCanvas({ chapter, progress }: Props) {
  const hostRef = useRef<HTMLDivElement>(null);
  const chapterRef = useRef(chapter);
  const progressRef = useRef(progress);
  chapterRef.current = chapter;
  progressRef.current = progress;

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const mobile = window.innerWidth < 760;
    const N = reduced ? 900 : mobile ? COUNT_MOBILE : COUNT_DESKTOP;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    } catch {
      return; // WebGL unavailable — CSS background still looks fine
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, mobile ? 1.5 : 1.75));
    renderer.setSize(host.clientWidth, host.clientHeight);
    renderer.setClearColor(0x04060a, 1);
    host.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x04060a, 0.045);
    const camera = new THREE.PerspectiveCamera(45, host.clientWidth / host.clientHeight, 0.1, 100);
    camera.position.set(0, 0, 11);

    const colA = new THREE.Color('#a5e4ff');
    const colB = new THREE.Color('#b4a2ff');

    // ── Core crystal ────────────────────────────────────────────────────
    const coreGroup = new THREE.Group();
    scene.add(coreGroup);
    const coreUniforms = {
      uTime: { value: 0 },
      uPulse: { value: 0 },
      uThink: { value: 0 },
      uColA: { value: colA },
      uColB: { value: colB },
    };
    const coreMat = new THREE.ShaderMaterial({
      uniforms: coreUniforms,
      vertexShader: CORE_VERT,
      fragmentShader: CORE_FRAG,
      transparent: true,
      extensions: { derivatives: true } as unknown as THREE.ShaderMaterial['extensions'],
    });
    const core = new THREE.Mesh(new THREE.IcosahedronGeometry(1.35, 1), coreMat);
    coreGroup.add(core);

    const shell = new THREE.LineSegments(
      new THREE.EdgesGeometry(new THREE.IcosahedronGeometry(2.05, 1)),
      new THREE.LineBasicMaterial({ color: colA, transparent: true, opacity: 0.22 }),
    );
    coreGroup.add(shell);

    const rings: THREE.Mesh[] = [];
    for (let i = 0; i < 3; i++) {
      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(2.5 + i * 0.32, 0.006, 6, 160),
        new THREE.MeshBasicMaterial({ color: i === 1 ? colB : colA, transparent: true, opacity: 0.35 - i * 0.08 }),
      );
      ring.rotation.set(Math.PI / 2 + i * 0.35, i * 0.6, 0);
      coreGroup.add(ring);
      rings.push(ring);
    }

    // ── Particles ───────────────────────────────────────────────────────
    const formations = buildFormations(N);
    const pos = new Float32Array(formations[0]);
    const vel = new Float32Array(N * 3);
    const seeds = new Float32Array(N);
    for (let i = 0; i < N; i++) seeds[i] = Math.random();
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geo.setAttribute('aSeed', new THREE.BufferAttribute(seeds, 1));
    const ptsUniforms = {
      uTime: { value: 0 },
      uSize: { value: mobile ? 2.6 : 3.2 },
      uColA: { value: colA },
      uColB: { value: new THREE.Color('#ffc861') },
    };
    const points = new THREE.Points(
      geo,
      new THREE.ShaderMaterial({
        uniforms: ptsUniforms,
        vertexShader: PTS_VERT,
        fragmentShader: PTS_FRAG,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    );
    const ptsGroup = new THREE.Group();
    ptsGroup.add(points);
    scene.add(ptsGroup);

    // ── Interaction state ──────────────────────────────────────────────
    const mouse = new THREE.Vector2(0, 0);
    const mouseSmooth = new THREE.Vector2(0, 0);
    const mouseWorld = new THREE.Vector3(999, 999, 0);
    const ray = new THREE.Raycaster();
    const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
    let shock = 0;
    let think = 0;
    let thinkTarget = 0;
    let lastScrollY = window.scrollY;
    let scrollVel = 0;

    const onMove = (e: PointerEvent) => {
      mouse.set((e.clientX / window.innerWidth) * 2 - 1, -(e.clientY / window.innerHeight) * 2 + 1);
    };
    const onDown = (e: PointerEvent) => {
      const t = e.target as HTMLElement | null;
      if (t?.closest('a,button,input,textarea,select,label,[data-no-pulse],.nx-panel,.cp-panel')) return;
      shock = 1;
    };
    const onCopilot = (e: Event) => {
      const d = (e as CustomEvent<{ thinking?: boolean }>).detail;
      thinkTarget = d?.thinking ? 1 : 0;
    };
    const onResize = () => {
      camera.aspect = host.clientWidth / host.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(host.clientWidth, host.clientHeight);
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('pointerdown', onDown, { passive: true });
    window.addEventListener('copilot:state', onCopilot);
    window.addEventListener('resize', onResize);

    // ── Loop ───────────────────────────────────────────────────────────
    const clock = new THREE.Clock();
    let raf = 0;
    let running = true;
    const corePos = new THREE.Vector3(CORE_LAYOUT[0][0], CORE_LAYOUT[0][1], 0);
    let coreScale = 1;
    const tmp = new THREE.Vector3();

    const tick = () => {
      if (!running) return;
      raf = requestAnimationFrame(tick);
      const dt = Math.min(clock.getDelta(), 0.05);
      const t = clock.elapsedTime;
      const ch = Math.max(0, Math.min(CORE_LAYOUT.length - 1, chapterRef.current));
      const narrow = window.innerWidth < 900;

      // scroll velocity → spin boost
      const sy = window.scrollY;
      scrollVel += ((sy - lastScrollY) * 0.002 - scrollVel) * 0.1;
      lastScrollY = sy;

      mouseSmooth.lerp(mouse, 0.06);
      think += (thinkTarget - think) * 0.05;
      shock *= 0.93;

      // core placement
      const [cx, cy, cs] = CORE_LAYOUT[ch];
      corePos.lerp(tmp.set(narrow ? cx * 0.25 : cx, narrow ? cy + (ch === 0 ? 1.8 : 0) : cy, 0), 0.04);
      coreScale += ((narrow && ch === 0 ? 0.7 : cs) - coreScale) * 0.05;
      coreGroup.position.copy(corePos);
      coreGroup.scale.setScalar(coreScale * (1 + shock * 0.12));

      coreUniforms.uTime.value = t;
      coreUniforms.uPulse.value = shock;
      coreUniforms.uThink.value = think;
      core.rotation.y += dt * (0.25 + think * 1.6) + scrollVel * 0.6;
      core.rotation.x = Math.sin(t * 0.3) * 0.25 + mouseSmooth.y * 0.4;
      shell.rotation.y -= dt * (0.12 + think * 0.8);
      shell.rotation.z = mouseSmooth.x * 0.3;
      rings.forEach((r, i) => {
        r.rotation.z += dt * (0.15 + i * 0.07) * (1 + think * 3);
      });

      // mouse → world point on z=0 plane (in particle-group space)
      ray.setFromCamera(mouseSmooth, camera);
      ray.ray.intersectPlane(plane, mouseWorld);
      ptsGroup.worldToLocal(mouseWorld);

      // particles: spring toward formation + cursor repulsion + shockwave
      const target = formations[ch];
      const p = geo.attributes.position.array as Float32Array;
      const k = 0.022;
      const damp = 0.86;
      for (let i = 0; i < N; i++) {
        const ix = i * 3;
        const px = p[ix];
        const py = p[ix + 1];
        const pz = p[ix + 2];
        let ax = (target[ix] - px) * k;
        let ay = (target[ix + 1] - py) * k;
        let az = (target[ix + 2] - pz) * k;

        const dx = px - mouseWorld.x;
        const dy = py - mouseWorld.y;
        const d2 = dx * dx + dy * dy + pz * pz * 0.15;
        if (d2 < 2.6) {
          const f = (2.6 - d2) * 0.012;
          ax += dx * f;
          ay += dy * f;
        }
        if (shock > 0.02) {
          const len = Math.sqrt(px * px + py * py + pz * pz) + 0.001;
          const s = shock * 0.06;
          ax += (px / len) * s;
          ay += (py / len) * s;
          az += (pz / len) * s;
        }
        vel[ix] = (vel[ix] + ax) * damp;
        vel[ix + 1] = (vel[ix + 1] + ay) * damp;
        vel[ix + 2] = (vel[ix + 2] + az) * damp;
        p[ix] = px + vel[ix];
        p[ix + 1] = py + vel[ix + 1];
        p[ix + 2] = pz + vel[ix + 2];
      }
      geo.attributes.position.needsUpdate = true;

      ptsUniforms.uTime.value = t;
      ptsGroup.rotation.y += dt * (ch === 4 ? 0.12 : 0.05) + scrollVel * 0.3;
      ptsGroup.rotation.x = ch === 2 ? 0.45 : ch === 5 ? 0.2 : Math.sin(t * 0.1) * 0.08;
      ptsGroup.position.x += ((ch === 0 && !narrow ? 1.2 : 0) - ptsGroup.position.x) * 0.03;

      // camera parallax
      camera.position.x += (mouseSmooth.x * 0.6 - camera.position.x) * 0.04;
      camera.position.y += (mouseSmooth.y * 0.4 - progressRef.current * 0.8 - camera.position.y) * 0.04;
      camera.lookAt(0, -progressRef.current * 0.8, 0);

      renderer.render(scene, camera);
    };
    tick();

    const onVis = () => {
      if (document.hidden) {
        running = false;
        cancelAnimationFrame(raf);
      } else if (!running) {
        running = true;
        clock.getDelta();
        tick();
      }
    };
    document.addEventListener('visibilitychange', onVis);

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerdown', onDown);
      window.removeEventListener('copilot:state', onCopilot);
      window.removeEventListener('resize', onResize);
      document.removeEventListener('visibilitychange', onVis);
      scene.traverse((o) => {
        const m = o as THREE.Mesh;
        if (m.geometry) m.geometry.dispose();
        const mat = m.material as THREE.Material | THREE.Material[] | undefined;
        if (Array.isArray(mat)) mat.forEach((x) => x.dispose());
        else mat?.dispose();
      });
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, []);

  return <div ref={hostRef} className="nx-canvas" aria-hidden="true" />;
}
