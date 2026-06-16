'use client';

export default function GlobalError({
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    return (
        <html>
            <body className='flex min-h-screen flex-col items-center justify-center gap-6 bg-violet-25 p-8 font-inter'>
                <div className='flex flex-col items-center gap-2 text-center'>
                    <h2 className='text-24 font-semibold text-gray-900'>
                        Something went wrong
                    </h2>
                    <p className='text-14 text-gray-600'>
                        An unexpected error occurred. Please try again.
                    </p>
                </div>
                <button
                    onClick={reset}
                    className='rounded-lg bg-bank-gradient px-6 py-3 text-14 font-semibold text-white shadow-form'>
                    Try again
                </button>
            </body>
        </html>
    );
}
