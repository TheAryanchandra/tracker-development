import type { Metadata } from 'next';
import CinematicPortfolio from '@/components/CinematicPortfolio';

export const metadata: Metadata = {
  title: 'Aryan Chandra — Software Engineer (SDE-1 / SWE-1) | Cinematic 3D Web Experience',
  description:
    'Immersive 3D portfolio of Aryan Chandra — Software Engineer specializing in Java 21, Spring Boot 3, Node.js, Next.js, and autonomous 3D Humanoid AI Copilot architectures.',
};

export default function Page() {
  return <CinematicPortfolio />;
}