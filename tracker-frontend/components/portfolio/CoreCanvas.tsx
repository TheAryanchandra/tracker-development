'use client';

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

/**
 * CoreCanvas — Signature Minimalist Interactive 3D Systems Sculpture
 * ─────────────────────────────────────────────────────────────────────────────
 * Inspired by Bruno Simon & Coffey Codes:
 *  • One signature, elegant geometric structure
 *  • Rotating crystalline wireframe geodesic lattice with glowing vertex nodes
 *  • Inner radiant quantum core sphere
 *  • Three concentric counter-rotating orbital rings with moving data photons
 *  • Subtle constellation particle cloud
 *  • Butter-smooth cursor parallax & drag-to-orbit with inertia damping
 *  • Interactive click pulse with Web Audio synthesized chime
 *  • Zero text in 3D geometry — keeping all typography in clean HTML
 */

function playPulseChime(freq = 640) {
  try {
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(freq * 1.5, ctx.currentTime + 0.14);
    gain.gain.setValueAtTime(0.04, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.14);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.15);
  } catch {
    // Graceful fallback if blocked by browser autoplay policy
  }
}

interface Props {
  chapter: number;
  progress: number;
}

export default function CoreCanvas({ chapter, progress }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chapterRef = useRef(chapter);
  const progressRef = useRef(progress);
  chapterRef.current = chapter;
  progressRef.current = progress;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let width = container.clientWidth || window.innerWidth;
    let height = container.clientHeight || window.innerHeight;

    // ── 1. Renderer, Camera & Scene Setup ────────────────────────
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance',
      });
    } catch {
      return;
    }

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    renderer.setClearColor(0x000000, 0);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x04060a, 0.04);

    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 50);
    camera.position.set(0, 0.4, 7.8);

    // ── 2. Restrained Cinematic Lighting ─────────────────────────
    const ambLight = new THREE.AmbientLight(0x081224, 1.8);
    scene.add(ambLight);

    const cyanDirLight = new THREE.DirectionalLight(0x38bdf8, 2.2);
    cyanDirLight.position.set(5, 8, 6);
    scene.add(cyanDirLight);

    const violetDirLight = new THREE.DirectionalLight(0x818cf8, 1.5);
    violetDirLight.position.set(-6, -4, 4);
    scene.add(violetDirLight);

    const corePointLight = new THREE.PointLight(0x00f0ff, 3.5, 12);
    corePointLight.position.set(0, 0, 0);
    scene.add(corePointLight);

    // ── 3. Central Signature Sculpture Hierarchy ─────────────────
    const mainGroup = new THREE.Group();
    scene.add(mainGroup);

    // Inner Glowing Quantum Energy Core
    const coreGeo = new THREE.SphereGeometry(0.88, 36, 36);
    const coreMat = new THREE.MeshStandardMaterial({
      color: 0x0284c7,
      emissive: 0x0ea5e9,
      emissiveIntensity: 2.4,
      roughness: 0.15,
      metalness: 0.85,
    });
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    mainGroup.add(coreMesh);

    // Soft Ethereal Atmosphere Halo
    const haloGeo = new THREE.SphereGeometry(0.96, 32, 32);
    const haloMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.2,
      blending: THREE.AdditiveBlending,
    });
    const haloMesh = new THREE.Mesh(haloGeo, haloMat);
    mainGroup.add(haloMesh);

    // Geometric Crystalline Wireframe Lattice (Icosahedron)
    const latticeGeo = new THREE.IcosahedronGeometry(1.55, 1);
    const wireframeMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      wireframe: true,
      transparent: true,
      opacity: 0.4,
    });
    const latticeMesh = new THREE.Mesh(latticeGeo, wireframeMat);
    mainGroup.add(latticeMesh);

    // Luminous Junction Nodes at every lattice vertex
    const nodeGroup = new THREE.Group();
    mainGroup.add(nodeGroup);
    const posAttr = latticeGeo.attributes.position;
    const vertexPoints: THREE.Vector3[] = [];
    for (let i = 0; i < posAttr.count; i++) {
      const v = new THREE.Vector3(posAttr.getX(i), posAttr.getY(i), posAttr.getZ(i));
      // Avoid duplicate points
      if (!vertexPoints.some((p) => p.distanceTo(v) < 0.05)) {
        vertexPoints.push(v);
        const nodeGeo = new THREE.SphereGeometry(0.045, 12, 12);
        const nodeMat = new THREE.MeshBasicMaterial({ color: 0xe0f2fe });
        const nodeMesh = new THREE.Mesh(nodeGeo, nodeMat);
        nodeMesh.position.copy(v);
        nodeGroup.add(nodeMesh);
      }
    }

    // ── 4. Three Intersecting Concentric Orbital Rings ────────────
    const ringConfigs = [
      { r: 2.05, tube: 0.016, color: 0x38bdf8, rotX: Math.PI / 2.3, rotZ: 0.35, speed: 0.5 },
      { r: 2.38, tube: 0.014, color: 0x818cf8, rotX: Math.PI / 1.7, rotZ: -0.6, speed: -0.65 },
      { r: 2.72, tube: 0.012, color: 0x38bdf8, rotX: Math.PI / 2.8, rotZ: 1.1, speed: 0.4 },
    ];

    const rings: { mesh: THREE.Mesh; config: typeof ringConfigs[0]; photons: THREE.Mesh[] }[] = [];
    const ringGroup = new THREE.Group();
    mainGroup.add(ringGroup);

    ringConfigs.forEach((cfg) => {
      const torusGeo = new THREE.TorusGeometry(cfg.r, cfg.tube, 8, 96);
      const torusMat = new THREE.MeshBasicMaterial({
        color: cfg.color,
        transparent: true,
        opacity: 0.8,
      });
      const torusMesh = new THREE.Mesh(torusGeo, torusMat);
      torusMesh.rotation.set(cfg.rotX, 0, cfg.rotZ);
      ringGroup.add(torusMesh);

      // Orbital Photons traveling on ring
      const photons: THREE.Mesh[] = [];
      const photonCount = 3;
      for (let p = 0; p < photonCount; p++) {
        const phGeo = new THREE.SphereGeometry(0.055, 10, 10);
        const phMat = new THREE.MeshBasicMaterial({ color: 0xf0f9ff });
        const phMesh = new THREE.Mesh(phGeo, phMat);
        torusMesh.add(phMesh);
        photons.push(phMesh);
      }

      rings.push({ mesh: torusMesh, config: cfg, photons });
    });

    // ── 5. Ambient Constellation Particle Cloud ──────────────────
    const particleCount = 90;
    const particleGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    const particleScales = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      const radius = 2.4 + Math.random() * 2.2;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);
      particlePositions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      particlePositions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      particlePositions[i * 3 + 2] = radius * Math.cos(phi);
      particleScales[i] = Math.random() * 0.03 + 0.02;
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0x7dd3fc,
      size: 0.05,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending,
    });
    const particlePoints = new THREE.Points(particleGeo, particleMat);
    mainGroup.add(particlePoints);

    // ── 6. Cursor Parallax & Inertial Drag-to-Orbit ───────────────
    const mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };
    const orbitEuler = new THREE.Euler(0, 0, 0, 'YXZ');
    let isDragging = false;
    let prevPointer = { x: 0, y: 0 };
    let pulseIntensity = 0;

    const onPointerMove = (e: PointerEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      const normX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const normY = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      mouse.targetX = normX * 0.4;
      mouse.targetY = normY * 0.3;

      if (isDragging) {
        const dx = e.clientX - prevPointer.x;
        const dy = e.clientY - prevPointer.y;
        orbitEuler.y += dx * 0.005;
        orbitEuler.x += dy * 0.005;
        orbitEuler.x = Math.max(-0.6, Math.min(0.6, orbitEuler.x));
        prevPointer = { x: e.clientX, y: e.clientY };
      }
    };

    const onPointerDown = (e: PointerEvent) => {
      isDragging = true;
      prevPointer = { x: e.clientX, y: e.clientY };
    };

    const onPointerUp = () => {
      isDragging = false;
    };

    const onPointerClick = () => {
      // Trigger energy ripple pulse
      pulseIntensity = 1.0;
      playPulseChime(720);
    };

    const domEl = renderer.domElement;
    domEl.style.cursor = 'grab';
    domEl.addEventListener('pointermove', onPointerMove, { passive: true });
    domEl.addEventListener('pointerdown', onPointerDown);
    domEl.addEventListener('click', onPointerClick);
    window.addEventListener('pointerup', onPointerUp);

    // ── 7. Animation Loop with Visibility & Reduced Motion Support ─
    let animId = 0;
    const clock = new THREE.Clock();
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const render = () => {
      animId = requestAnimationFrame(render);
      const dt = clock.getDelta();
      const t = clock.getElapsedTime();
      const prog = progressRef.current;

      // Smooth mouse lerp
      mouse.x += (mouse.targetX - mouse.x) * 0.06;
      mouse.y += (mouse.targetY - mouse.y) * 0.06;

      // Pulse decay
      pulseIntensity = Math.max(0, pulseIntensity - dt * 2.2);

      const motionSpeed = prefersReducedMotion ? 0.05 : 1.0;

      // Continuous slow rotation of main group
      mainGroup.rotation.y += dt * 0.22 * motionSpeed;
      latticeMesh.rotation.y -= dt * 0.12 * motionSpeed;
      latticeMesh.rotation.x += dt * 0.08 * motionSpeed;

      // Scroll-linked transformation into Systems Lab section
      // As user scrolls down, object shifts subtly in depth and Y position
      const scrollYOffset = prog * -1.8;
      const scrollScale = Math.max(0.75, 1.0 - prog * 0.35);
      mainGroup.position.y = THREE.MathUtils.lerp(mainGroup.position.y, scrollYOffset, 0.08);

      // Parallax tilt combined with user orbit drag
      mainGroup.rotation.x = THREE.MathUtils.lerp(mainGroup.rotation.x, orbitEuler.x - mouse.y, 0.06);
      mainGroup.rotation.z = THREE.MathUtils.lerp(mainGroup.rotation.z, mouse.x * 0.4, 0.06);

      // Pulse effects on core
      const currentScale = (1.0 + Math.sin(t * 2.5) * 0.02 + pulseIntensity * 0.12) * scrollScale;
      coreMesh.scale.setScalar(currentScale);
      haloMesh.scale.setScalar(currentScale * 1.08);

      corePointLight.intensity = 3.5 + Math.sin(t * 3.0) * 0.8 + pulseIntensity * 6.0;

      // Rotate orbital rings and move photons
      rings.forEach(({ mesh, config, photons }) => {
        mesh.rotation.z += dt * config.speed * motionSpeed;

        photons.forEach((ph, pIdx) => {
          const phAngle = (t * (0.8 + pIdx * 0.2) + pIdx * (Math.PI * 2 / 3)) % (Math.PI * 2);
          ph.position.x = Math.cos(phAngle) * config.r;
          ph.position.y = Math.sin(phAngle) * config.r;
        });
      });

      // Ambient particle slow drift
      particlePoints.rotation.y += dt * 0.05 * motionSpeed;

      renderer.render(scene, camera);
    };

    render();

    const handleVisibilityChange = () => {
      if (document.hidden) {
        cancelAnimationFrame(animId);
      } else {
        clock.start();
        render();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    const onResize = () => {
      if (!container) return;
      width = container.clientWidth || window.innerWidth;
      height = container.clientHeight || window.innerHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };
    window.addEventListener('resize', onResize);

    return () => {
      cancelAnimationFrame(animId);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('resize', onResize);
      domEl.removeEventListener('pointermove', onPointerMove);
      domEl.removeEventListener('pointerdown', onPointerDown);
      domEl.removeEventListener('click', onPointerClick);
      window.removeEventListener('pointerup', onPointerUp);
      scene.traverse((o) => {
        if (o instanceof THREE.Mesh || o instanceof THREE.Points || o instanceof THREE.Line) {
          o.geometry.dispose();
          if (Array.isArray(o.material)) o.material.forEach((m) => m.dispose());
          else o.material.dispose();
        }
      });
      renderer.dispose();
      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div className="w-full h-full min-h-[440px] lg:min-h-[540px] relative select-none">
      <div ref={containerRef} className="w-full h-full absolute inset-0 cursor-grab active:cursor-grabbing" />
      {/* Understated technical annotation */}
      <div className="absolute bottom-3 right-4 pointer-events-none z-10 hidden sm:flex items-center gap-2 text-[10px] font-mono text-zinc-400">
        <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-ping" />
        <span>THREE.JS // QUANTUM TOPOLOGY CORE</span>
      </div>
    </div>
  );
}
