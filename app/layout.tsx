import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Mystère et boule de gomme',
  description: 'Clique pour découvrir 🤫',
  openGraph: {
    title: 'Mystère et boule de gomme',
    description: 'Clique pour découvrir 🤫',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Mystère et boule de gomme',
    description: 'Clique pour découvrir 🤫',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Caveat:wght@600;700&family=Quicksand:wght@500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
