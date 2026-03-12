import './globals.css';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Jack Lynch',
  description: 'Software developer.',
  openGraph: {
    title: 'Jack Lynch',
    description: 'Software developer.',
    url: 'https://jacklynch.dev',
    siteName: 'Jack Lynch',
    type: 'website',
  },
  twitter: {
    card: 'summary',
  },
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: '/apple-touch-icon.png',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="container">
          {children}
        </div>
      </body>
    </html>
  );
}
