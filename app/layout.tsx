export const dynamic = 'force-dynamic';

import type { Metadata } from 'next';
import { Inter, IBM_Plex_Serif } from 'next/font/google';
import './globals.css';

import { Toaster } from '@/components/ui/sonner';
import '@/lib/env-validation'; // Runtime environment validation

import * as Sentry from '@sentry/nextjs';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const ibmPlexSerif = IBM_Plex_Serif({
    subsets: ['latin'],
    weight: ['400', '700'],
    variable: '--font-ibm-plex-serif',
});

export const metadata: Metadata = {
    title: 'Upscale Banking',
    description: 'Bank Smarter. Live Upscale.',
    icons: {
        icon: '/icons/logo.svg',
    },
    other: {
        ...Sentry.getTraceData(),
    },
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang='en'>
            <body className={`${inter.variable} ${ibmPlexSerif.variable}`}>
                {children}
                <Toaster position='bottom-center' />
            </body>
        </html>
    );
}
