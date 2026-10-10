'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

export type HumanoidState = 'idle' | 'listening' | 'thinking' | 'speaking' | 'error';

interface HumanoidAvatarCanvasProps {
  state?: HumanoidState;
  audioAmplitude?: number; // 0 to 1 for live lip-sync
  className?: string;
  size?: number;
  interactive?: boolean;
}

export default function HumanoidAvatarCanvas({
  state = 'idle',
  audioAmplitude = 0,
  className = '',
  size,
  interactive = true,
}: HumanoidAvatarCanvasProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const stateRef = useRef({
    state,
    audioAmplitude,
    mouseX: 0,
    mouseY: 0,
    targetX: 0,
    targetY: 0,
  });
  const [hasWebGL, setHasWebGL] = useState(true);

  useEffect(() => {
    stateRef.current.state = state;
    stateRef.current.audioAmplitude = audioAmplitude;
  }, [state, audioAmplitude]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (!gl) {
        setHasWebGL(false);
        return;
      }
    } catch {
      setHasWebGL(false);
      return;
    }

    const width = size || container.clientWidth || 300;
    const height = size || container.clientHeight || 300;

    // 1. Scene & Camera
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 100);
    camera.position.set(0, 0, 4.6);

    // 2. Renderer
    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.35;
    container.appendChild(renderer.domElement);

    // 3. Futuristic Lighting
    const ambientLight = new THREE.AmbientLight(0x0c1022, 1.2);
    scene.add(ambientLight);

    // Key Light (Warm Cyber Gold)
    const keyLight = new THREE.DirectionalLight(0xf59e0b, 3.2);
    keyLight.position.set(3.5, 4, 3.5);
    scene.add(keyLight);

    // Rim Light (Electric Cyan)
    const rimLight = new THREE.DirectionalLight(0x06b6d4, 3.5);
    rimLight.position.set(-3.5, -2, -2.5);
    scene.add(rimLight);

    // Under Glow (Neon Purple)
    const underLight = new THREE.PointLight(0x8b5cf6, 2.5, 6);
    underLight.position.set(0, -2, 1);
    scene.add(underLight);

    // 4. Humanoid Head Hierarchy
    const avatarGroup = new THREE.Group();
    scene.add(avatarGroup);

    // Materials
    const chassisMat = new THREE.MeshStandardMaterial({
      color: 0x0f111a,
      roughness: 0.18,
      metalness: 0.92,
    });

    const plateMat = new THREE.MeshStandardMaterial({
      color: 0x1a1d2e,
      roughness: 0.25,
      metalness: 0.85,
    });

    const goldAccentMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      emissive: 0xd97706,
      emissiveIntensity: 0.6,
      roughness: 0.12,
      metalness: 0.95,
    });

    const visorMat = new THREE.MeshPhysicalMaterial({
      color: 0x050712,
      emissive: 0xf59e0b,
      emissiveIntensity: 0.85,
      roughness: 0.08,
      metalness: 0.95,
      transmission: 0.55,
      transparent: true,
      opacity: 0.95,
    });

    // Cranium Shell (Upper Head)
    const craniumGeo = new THREE.SphereGeometry(1.02, 36, 28, 0, Math.PI * 2, 0, Math.PI * 0.68);
    const cranium = new THREE.Mesh(craniumGeo, chassisMat);
    cranium.scale.set(0.95, 1.12, 1.0);
    avatarGroup.add(cranium);

    // Temporal Ear Pods (Left & Right Cyber Nodes)
    [-1.02, 1.02].forEach((x, idx) => {
      const earGeo = new THREE.CylinderGeometry(0.22, 0.26, 0.18, 16);
      const ear = new THREE.Mesh(earGeo, plateMat);
      ear.rotation.z = Math.PI / 2;
      ear.position.set(x, 0.1, 0.05);
      avatarGroup.add(ear);

      const earRingGeo = new THREE.TorusGeometry(0.2, 0.02, 8, 24);
      const earRing = new THREE.Mesh(earRingGeo, goldAccentMat);
      earRing.rotation.y = Math.PI / 2;
      earRing.position.set(x + (idx === 0 ? -0.08 : 0.08), 0.1, 0.05);
      earRing.name = `earRing_${idx}`;
      avatarGroup.add(earRing);
    });

    // Crown Crest (Sleek aerodynamic top plate)
    const crestGeo = new THREE.BoxGeometry(0.3, 0.12, 1.2);
    const crest = new THREE.Mesh(crestGeo, goldAccentMat);
    crest.position.set(0, 1.15, -0.1);
    crest.rotation.x = -Math.PI * 0.08;
    avatarGroup.add(crest);

    // Optic Visor (Curved Panoramic Cyber Shield)
    const visorGeo = new THREE.CylinderGeometry(0.88, 0.88, 0.36, 32, 1, true, -Math.PI * 0.36, Math.PI * 0.72);
    const visor = new THREE.Mesh(visorGeo, visorMat);
    visor.position.set(0, 0.18, 0.28);
    visor.rotation.y = -Math.PI * 0.36;
    avatarGroup.add(visor);

    // Dual Ocular Scanner Reticles (Luminous Optic Nodes)
    const eyeGeo = new THREE.SphereGeometry(0.075, 16, 16);
    const eyeMat = new THREE.MeshBasicMaterial({ color: 0xfef08a });

    const leftEye = new THREE.Mesh(eyeGeo, eyeMat);
    leftEye.position.set(-0.35, 0.18, 0.98);
    avatarGroup.add(leftEye);

    const rightEye = new THREE.Mesh(eyeGeo, eyeMat);
    rightEye.position.set(0.35, 0.18, 0.98);
    avatarGroup.add(rightEye);

    // Moveable Lower Mandible / Jaw for Real-Time Lip-Sync
    const jawPivot = new THREE.Group();
    jawPivot.position.set(0, -0.15, 0.1); // Pivot near jaw joint
    avatarGroup.add(jawPivot);

    const jawGeo = new THREE.ConeGeometry(0.72, 0.85, 16);
    const jaw = new THREE.Mesh(jawGeo, chassisMat);
    jaw.rotation.x = Math.PI;
    jaw.position.set(0, -0.35, 0.22);
    jaw.scale.set(0.86, 0.88, 0.88);
    jawPivot.add(jaw);

    // Chin Micro-Emitter
    const chinGeo = new THREE.BoxGeometry(0.28, 0.12, 0.25);
    const chin = new THREE.Mesh(chinGeo, goldAccentMat);
    chin.position.set(0, -0.74, 0.28);
    jawPivot.add(chin);

    // Internal Glowing Neural Matrix
    const matrixGeo = new THREE.IcosahedronGeometry(0.42, 1);
    const matrixMat = new THREE.MeshBasicMaterial({
      color: 0xf59e0b,
      wireframe: true,
      transparent: true,
      opacity: 0.65,
    });
    const neuralMatrix = new THREE.Mesh(matrixGeo, matrixMat);
    neuralMatrix.position.set(0, 0.25, -0.05);
    avatarGroup.add(neuralMatrix);

    // Orbital Holographic Gyroscope Rings
    const ring1Geo = new THREE.TorusGeometry(1.65, 0.016, 16, 64);
    const ring1Mat = new THREE.MeshBasicMaterial({ color: 0xf59e0b, transparent: true, opacity: 0.55 });
    const ring1 = new THREE.Mesh(ring1Geo, ring1Mat);
    scene.add(ring1);

    const ring2Geo = new THREE.TorusGeometry(1.9, 0.012, 16, 64);
    const ring2Mat = new THREE.MeshBasicMaterial({ color: 0x06b6d4, transparent: true, opacity: 0.45 });
    const ring2 = new THREE.Mesh(ring2Geo, ring2Mat);
    ring2.rotation.x = Math.PI * 0.45;
    scene.add(ring2);

    // Quantum Particle Aura
    const particleCount = 55;
    const particleGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i += 3) {
      particlePositions[i] = (Math.random() - 0.5) * 5.5;
      particlePositions[i + 1] = (Math.random() - 0.5) * 5.5;
      particlePositions[i + 2] = (Math.random() - 0.5) * 3.5;
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0xf59e0b,
      size: 0.04,
      transparent: true,
      opacity: 0.65,
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    // Mouse Tracking Event
    const handleMouseMove = (e: MouseEvent) => {
      if (!interactive) return;
      const rect = container.getBoundingClientRect();
      const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const ny = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      stateRef.current.targetX = nx * 0.32;
      stateRef.current.targetY = ny * 0.22;
    };
    window.addEventListener('mousemove', handleMouseMove);

    // Resize Handler
    const handleResize = () => {
      if (size) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      if (w && h) {
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
      }
    };
    window.addEventListener('resize', handleResize);

    // 5. High-Frequency Animation Loop
    let animId = 0;
    const clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();
      const current = stateRef.current;

      // Smooth Head Tracking with spring interpolation
      current.mouseX += (current.targetX - current.mouseX) * 0.09;
      current.mouseY += (current.targetY - current.mouseY) * 0.09;

      avatarGroup.rotation.y = current.mouseX;
      avatarGroup.rotation.x = -current.mouseY;

      // State Machine Procedural Animation
      if (current.state === 'idle') {
        // Natural Cyber Breathing
        avatarGroup.position.y = Math.sin(elapsed * 1.6) * 0.05;
        neuralMatrix.rotation.y = elapsed * 0.45;
        neuralMatrix.rotation.x = elapsed * 0.25;
        jawPivot.rotation.x = 0;
        visorMat.emissive.setHex(0xf59e0b); // Gold
        visorMat.emissiveIntensity = 0.5 + Math.sin(elapsed * 2.5) * 0.15;
        ring1.rotation.z = elapsed * 0.18;
        ring2.rotation.y = elapsed * 0.22;
      } else if (current.state === 'listening') {
        // Cyan Acoustic Resonance
        avatarGroup.position.y = Math.sin(elapsed * 2.2) * 0.03;
        neuralMatrix.rotation.y = elapsed * 1.4;
        visorMat.emissive.setHex(0x06b6d4); // Cyan
        visorMat.emissiveIntensity = 0.9 + Math.sin(elapsed * 5) * 0.3;
        eyeMat.color.setHex(0x67e8f9);
        jawPivot.rotation.x = 0;
        ring1.rotation.z = elapsed * 0.8;
        ring2.rotation.y = elapsed * 0.9;
      } else if (current.state === 'thinking') {
        // Violet Neural Processing Surge
        avatarGroup.position.y = Math.sin(elapsed * 3.5) * 0.04;
        neuralMatrix.rotation.y = elapsed * 3.8;
        neuralMatrix.rotation.x = elapsed * 2.2;
        visorMat.emissive.setHex(0x8b5cf6); // Purple
        visorMat.emissiveIntensity = 1.0 + Math.sin(elapsed * 8) * 0.4;
        eyeMat.color.setHex(0xc084fc);
        jawPivot.rotation.x = 0;
        ring1.rotation.z = elapsed * 1.6;
        ring2.rotation.y = elapsed * -1.8;
      } else if (current.state === 'speaking') {
        // Live Lip-Sync Mouth Articulation
        const targetJawDrop = Math.max(0.06, current.audioAmplitude * 0.45 + (Math.sin(elapsed * 14) * 0.12));
        jawPivot.rotation.x = THREE.MathUtils.lerp(jawPivot.rotation.x, targetJawDrop, 0.4);

        avatarGroup.position.y = Math.sin(elapsed * 2.8) * 0.035;
        neuralMatrix.rotation.y = elapsed * 1.9;
        visorMat.emissive.setHex(0xf59e0b); // Amber
        visorMat.emissiveIntensity = 0.85 + current.audioAmplitude * 0.9;
        eyeMat.color.setHex(0xfef08a);
        ring1.rotation.z = elapsed * 0.6;
        ring2.rotation.y = elapsed * 0.7;
      } else if (current.state === 'error') {
        // Crimson Alert
        visorMat.emissive.setHex(0xef4444);
        visorMat.emissiveIntensity = 1.1;
        eyeMat.color.setHex(0xf87171);
        avatarGroup.position.x = Math.sin(elapsed * 18) * 0.02;
        jawPivot.rotation.x = 0;
      }

      particles.rotation.y = elapsed * 0.04;
      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
      scene.clear();
    };
  }, [size, interactive]);

  if (!hasWebGL) {
    return (
      <div className={`relative flex items-center justify-center ${className}`}>
        <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-amber-500 to-indigo-600 animate-pulse flex items-center justify-center text-xs font-bold text-white shadow-lg">
          JARVIS
        </div>
      </div>
    );
  }

  return (
    <div
      ref={mountRef}
      className={`relative select-none pointer-events-auto ${className}`}
      style={{
        width: size ? `${size}px` : '100%',
        height: size ? `${size}px` : '100%',
      }}
      aria-label="3D Cybernetic Humanoid Avatar"
    />
  );
}
