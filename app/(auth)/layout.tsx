import Image from 'next/image';

export default function AuthLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <main className='flex min-h-screen w-full font-inter'>
            <div className='flex flex-1 min-h-screen'>
                {children}
            </div>
            <div className='auth-asset'>
                <Image
                    src='/icons/auth-image-start.jpeg'
                    alt='Banking illustration'
                    width={800}
                    height={800}
                    className='object-contain rounded-xl max-h-[80vh] w-auto'
                    priority
                />
            </div>
        </main>
    );
}
