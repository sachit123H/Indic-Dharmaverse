import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Indic Dharmaverse',
  description: 'Comparative ancient literature analysis',
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