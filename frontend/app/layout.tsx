import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const viewport: Viewport = {
  themeColor: '#10b981',
};

export const metadata: Metadata = {
  title: 'AgriSmart - Smart Farming Assistant',
  description: 'AI-powered agricultural advisory platform for Malawi farmers',
  manifest: '/manifest.json',
   icons: {
    icon: '/leaf-icon.svg', // This points to public/leaf-icon.svg
  },
  viewport,
  themeColor: viewport.themeColor,
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'AgriSmart',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
      </body>
    </html>
  );
}