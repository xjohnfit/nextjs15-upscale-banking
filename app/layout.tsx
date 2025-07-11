export const dynamic = 'force-dynamic';

import type { Metadata } from 'next';
import { Inter, IBM_Plex_Serif } from 'next/font/google';
import './globals.css';

import { Toaster } from '@/components/ui/sonner';
import AuthDebug from '@/components/AuthDebug';
import '@/lib/env-validation'; // Runtime environment validation
import '@/lib/dev-warnings'; // Suppress development warnings

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
    const isProduction = process.env.NODE_ENV === 'production';

    return (
        <html lang='en'>
            <body className={`${inter.variable} ${ibmPlexSerif.variable}`}>
                {children}
                <Toaster position='bottom-center' />
                <AuthDebug isProduction={isProduction} />
            </body>
        </html>
    );
}
