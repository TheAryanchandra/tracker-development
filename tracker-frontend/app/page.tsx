import type { Metadata } from 'next';
import IglooPortfolio from '@/components/IglooPortfolio';

export const metadata: Metadata = {
  title: 'Aryan Chandra // Software Engineer (SDE-1) & AI Systems | 3D Igloo Experience',
  description:
    'Photorealistic 3D Glacial Igloo portfolio of Aryan Chandra — Software Engineer specializing in Java 21, Spring Boot 3, Kafka, LangGraph multi-agent AI, and 10,000+ mobile downloads.',
};

export default function Page() {
  return <IglooPortfolio />;
}