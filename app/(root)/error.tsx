'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error(error);
    }, [error]);

    return (
        <div className='flex h-screen w-full flex-col items-center justify-center gap-6 px-4'>
            <div className='flex flex-col items-center gap-2 text-center'>
                <h2 className='text-24 font-semibold text-gray-900'>
                    Something went wrong
                </h2>
                <p className='text-14 text-gray-600 max-w-sm'>
                    We couldn&apos;t load this page. Please try again or return to the dashboard.
                </p>
            </div>
            <div className='flex gap-4'>
                <button
                    onClick={reset}
                    className='text-14 rounded-lg border border-gray-300 px-4 py-2.5 font-semibold text-gray-700 hover:bg-gray-50'>
                    Try again
                </button>
                <Link
                    href='/'
                    className='text-14 rounded-lg bg-bank-gradient px-4 py-2.5 font-semibold text-white shadow-form'>
                    Go to dashboard
                </Link>
            </div>
        </div>
    );
}
