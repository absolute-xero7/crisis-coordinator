import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'CrisisCoordinator - Toronto Emergency Response',
  description:
    'Multi-agent AI system for emergency response simulation and training. Built for Toronto emergency operations.',
  keywords: 'emergency response, Toronto, AI, multi-agent, simulation, training',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
