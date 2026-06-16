import MobileNav from '@/components/MobileNav';
import Sidebar from '@/components/Sidebar';
import { getLoggedInUser } from '@/lib/actions/user.actions';
import Image from 'next/image';
import { redirect } from 'next/navigation';

export default async function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const loggedIn = await getLoggedInUser();

    if (!loggedIn) {
        redirect('/sign-in');
    }

    return (
        <main className='flex h-screen w-full font-inter'>
            <Sidebar user={loggedIn} />

            <div className='flex flex-1 min-w-0 flex-col'>
                <div className='root-layout'>
                    <div className='flex items-center gap-3'>
                        <Image
                            src='/icons/upscale-banking-logo.png'
                            width={34}
                            height={34}
                            alt='logo'
                            priority
                            className='size-9 shrink-0'
                        />
                        <h1 className='text-18 font-ibm-plex-serif font-bold bg-bank-gradient bg-clip-text text-transparent'>
                            Upscale Banking
                        </h1>
                    </div>
                    <div>
                        <MobileNav user={loggedIn} />
                    </div>
                </div>
                {children}
            </div>
        </main>
    );
}
