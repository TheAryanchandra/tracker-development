import type { Metadata } from 'next';
import GlacierPortfolio from '@/components/portfolio/GlacierPortfolio';

export const metadata: Metadata = {
  title: 'Aryan Chandra // Software Engineer (SDE-1) | 3D Interactive Portfolio',
  description:
    'Interactive 3D Glacier portfolio of Aryan Chandra — Software Engineer (SDE-1) specializing in Java 21, Spring Boot 3, Apache Kafka, LangGraph multi-agent AI, and 10,000+ mobile downloads on Google Play Store.',
};

export default function Page() {
  return <GlacierPortfolio />;
}