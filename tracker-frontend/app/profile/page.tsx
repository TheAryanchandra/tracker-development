import type { Metadata } from 'next';
import ProfileShowcase from '@/components/ProfileShowcase';

export const metadata: Metadata = {
  title: 'Profile & 3D Interactive Showcase | Aryan Chandra — Software Engineer (SDE-1 / SWE-1)',
  description:
    'Interactive 3D profile and engineering portfolio of Aryan Chandra — Software Engineer specializing in Java 21, Spring Boot, Node.js, Next.js, Gemini AI agents, and mobile architectures.',
};

export default function ProfilePage() {
  return <ProfileShowcase />;
}
