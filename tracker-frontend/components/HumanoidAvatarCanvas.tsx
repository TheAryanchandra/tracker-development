'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

export type HumanoidState = 'idle' | 'listening' | 'thinking' | 'speaking' | 'error';

interface HumanoidAvatarCanvasProps {
  state?: HumanoidState;
  audioAmplitude?: number; // 0 to 1 for live lipsync
  className?: string;
  size?: number; // width & height in px, or responsive container if not given
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

  // Keep stateRef up to date for the animation loop
  useEffect(() => {
    stateRef.current.state = state;
    stateRef.current.audioAmplitude = audioAmplitude;
  }, [state, audioAmplitude]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // WebGL support check
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
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0, 5.2);

    // 2. Renderer
    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    container.appendChild(renderer.domElement);

    // 3. Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xf59e0b, 2.5); // Warm Amber
    keyLight.position.set(3, 4, 3);
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0x6366f1, 2.8); // Cyber Indigo
    rimLight.position.set(-3, -2, -2);
    scene.add(rimLight);

    const coreLight = new THREE.PointLight(0xf59e0b, 3, 4);
    coreLight.position.set(0, 0.1, 0.2);
    scene.add(coreLight);

    // 4. Humanoid Head Hierarchy
    const avatarRoot = new THREE.Group();
    scene.add(avatarRoot);

    // Cranium (Upper Cyber Skull)
    const craniumGeo = new THREE.SphereGeometry(1, 32, 24, 0, Math.PI * 2, 0, Math.PI * 0.65);
    const craniumMat = new THREE.MeshStandardMaterial({
      color: 0x111322,
      roughness: 0.2,
      metalness: 0.9,
    });
    const cranium = new THREE.Mesh(craniumGeo, craniumMat);
    cranium.scale.set(0.95, 1.1, 1);
    avatarRoot.add(cranium);

    // Crown Plate (Futuristic Top Shell)
    const crownGeo = new THREE.CylinderGeometry(0.65, 0.9, 0.35, 16);
    const crownMat = new THREE.MeshStandardMaterial({
      color: 0x1e2238,
      roughness: 0.3,
      metalness: 0.8,
    });
    const crown = new THREE.Mesh(crownGeo, crownMat);
    crown.position.set(0, 0.85, -0.1);
    avatarRoot.add(crown);

    // Optic Visor (Curved holographic eye shield)
    const visorGeo = new THREE.CylinderGeometry(0.85, 0.85, 0.32, 24, 1, true, -Math.PI * 0.35, Math.PI * 0.7);
    const visorMat = new THREE.MeshPhysicalMaterial({
      color: 0x070914,
      emissive: 0xf59e0b,
      emissiveIntensity: 0.6,
      roughness: 0.1,
      metalness: 0.9,
      transmission: 0.6,
      transparent: true,
      opacity: 0.92,
    });
    const visor = new THREE.Mesh(visorGeo, visorMat);
    visor.position.set(0, 0.15, 0.25);
    visor.rotation.y = -Math.PI * 0.35;
    avatarRoot.add(visor);

    // Ocular Eye Nodes (Left & Right glowing scanner optics)
    const eyeGeo = new THREE.SphereGeometry(0.08, 16, 16);
    const eyeMat = new THREE.MeshBasicMaterial({ color: 0xfbbf24 });

    const leftEye = new THREE.Mesh(eyeGeo, eyeMat);
    leftEye.position.set(-0.35, 0.15, 0.95);
    avatarRoot.add(leftEye);

    const rightEye = new THREE.Mesh(eyeGeo, eyeMat);
    rightEye.position.set(0.35, 0.15, 0.95);
    avatarRoot.add(rightEye);

    // Lower Mandible / Jaw (Movable for Lip-Sync)
    const jawPivot = new THREE.Group();
    jawPivot.position.set(0, -0.2, 0.1); // Pivot near jaw joint
    avatarRoot.add(jawPivot);

    const jawGeo = new THREE.ConeGeometry(0.7, 0.8, 16);
    const jawMat = new THREE.MeshStandardMaterial({
      color: 0x181a2e,
      roughness: 0.25,
      metalness: 0.85,
    });
    const jaw = new THREE.Mesh(jawGeo, jawMat);
    jaw.rotation.x = Math.PI;
    jaw.position.set(0, -0.3, 0.2);
    jaw.scale.set(0.85, 0.9, 0.9);
    jawPivot.add(jaw);

    // Cybernetic Chin Accent
    const chinGeo = new THREE.BoxGeometry(0.3, 0.15, 0.3);
    const chinMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      emissive: 0xd97706,
      emissiveIntensity: 0.5,
    });
    const chin = new THREE.Mesh(chinGeo, chinMat);
    chin.position.set(0, -0.7, 0.25);
    jawPivot.add(chin);

    // Spinning Neural Core (Inside Cranium)
    const coreGeo = new THREE.DodecahedronGeometry(0.4, 0);
    const coreMat = new THREE.MeshBasicMaterial({
      color: 0xf59e0b,
      wireframe: true,
      transparent: true,
      opacity: 0.7,
    });
    const neuralCore = new THREE.Mesh(coreGeo, coreMat);
    neuralCore.position.set(0, 0.2, -0.1);
    avatarRoot.add(neuralCore);

    // Orbital Holographic Rings
    const ringGeo1 = new THREE.TorusGeometry(1.6, 0.015, 16, 64);
    const ringMat1 = new THREE.MeshBasicMaterial({
      color: 0xf59e0b,
      transparent: true,
      opacity: 0.45,
    });
    const ring1 = new THREE.Mesh(ringGeo1, ringMat1);
    scene.add(ring1);

    const ringGeo2 = new THREE.TorusGeometry(1.85, 0.012, 16, 64);
    const ringMat2 = new THREE.MeshBasicMaterial({
      color: 0x6366f1,
      transparent: true,
      opacity: 0.35,
    });
    const ring2 = new THREE.Mesh(ringGeo2, ringMat2);
    ring2.rotation.x = Math.PI * 0.4;
    scene.add(ring2);

    // Ambient Floating Neural Particles
    const particleCount = 45;
    const particleGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i += 3) {
      particlePositions[i] = (Math.random() - 0.5) * 6;
      particlePositions[i + 1] = (Math.random() - 0.5) * 6;
      particlePositions[i + 2] = (Math.random() - 0.5) * 4;
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0xf59e0b,
      size: 0.04,
      transparent: true,
      opacity: 0.6,
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    // Mouse Tracking Event
    const handleMouseMove = (e: MouseEvent) => {
      if (!interactive) return;
      const rect = container.getBoundingClientRect();
      const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const ny = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      stateRef.current.targetX = nx * 0.35;
      stateRef.current.targetY = ny * 0.25;
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

    // 5. Animation Loop
    let animId = 0;
    let clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();
      const current = stateRef.current;

      // Mouse Lerp Smooth Head Rotation
      current.mouseX += (current.targetX - current.mouseX) * 0.08;
      current.mouseY += (current.targetY - current.mouseY) * 0.08;

      avatarRoot.rotation.y = current.mouseX;
      avatarRoot.rotation.x = -current.mouseY;

      // State-specific procedural behaviors
      if (current.state === 'idle') {
        // Subtle Breathing
        avatarRoot.position.y = Math.sin(elapsed * 1.5) * 0.06;
        neuralCore.rotation.y = elapsed * 0.5;
        neuralCore.rotation.x = elapsed * 0.3;
        jawPivot.rotation.x = 0;
        visorMat.emissive.setHex(0xf59e0b);
        visorMat.emissiveIntensity = 0.4 + Math.sin(elapsed * 2) * 0.15;
        ring1.rotation.z = elapsed * 0.2;
        ring2.rotation.y = elapsed * 0.25;
      } else if (current.state === 'listening') {
        // Alert posture + audio reactive ring pulse
        avatarRoot.position.y = Math.sin(elapsed * 2) * 0.04;
        neuralCore.rotation.y = elapsed * 1.2;
        visorMat.emissive.setHex(0x06b6d4); // Cyan Listening
        visorMat.emissiveIntensity = 0.8 + Math.sin(elapsed * 4) * 0.3;
        jawPivot.rotation.x = 0;
        ring1.rotation.z = elapsed * 0.6;
        ring2.rotation.y = elapsed * 0.7;
      } else if (current.state === 'thinking') {
        // Fast spinning neural core + violet/amber pulse
        avatarRoot.position.y = Math.sin(elapsed * 3) * 0.05;
        neuralCore.rotation.y = elapsed * 3.5;
        neuralCore.rotation.x = elapsed * 2.0;
        visorMat.emissive.setHex(0x8b5cf6); // Purple Thinking
        visorMat.emissiveIntensity = 0.9 + Math.sin(elapsed * 6) * 0.4;
        jawPivot.rotation.x = 0;
        ring1.rotation.z = elapsed * 1.2;
        ring2.rotation.y = elapsed * -1.5;
      } else if (current.state === 'speaking') {
        // Live Lipsync: rotate jaw based on audioAmplitude or speech waveform
        const targetJawDrop = Math.max(0.08, current.audioAmplitude * 0.45 + (Math.sin(elapsed * 12) * 0.12));
        jawPivot.rotation.x = THREE.MathUtils.lerp(jawPivot.rotation.x, targetJawDrop, 0.35);

        avatarRoot.position.y = Math.sin(elapsed * 2.5) * 0.04;
        neuralCore.rotation.y = elapsed * 1.8;
        visorMat.emissive.setHex(0xf59e0b); // Radiant Amber Speaking
        visorMat.emissiveIntensity = 0.7 + current.audioAmplitude * 0.8;
        ring1.rotation.z = elapsed * 0.5;
        ring2.rotation.y = elapsed * 0.6;
      } else if (current.state === 'error') {
        // Crimson warning glow
        visorMat.emissive.setHex(0xef4444);
        visorMat.emissiveIntensity = 1.0;
        avatarRoot.position.x = Math.sin(elapsed * 15) * 0.02;
        jawPivot.rotation.x = 0;
      }

      // Slowly rotate particle field
      particles.rotation.y = elapsed * 0.05;

      renderer.render(scene, camera);
    };

    animate();

    // Cleanup
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

  // Graceful fallback for browsers without WebGL
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
