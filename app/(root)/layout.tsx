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

            <div className='flex size-full flex-col'>
                <div className='root-layout'>
                    <div className='flex items-center gap-3 md:gap-5'>
                        <Image
                        src='/icons/logo.svg'
                        width={30}
                        height={30}
                        alt='logo'
                        priority
                    />
                    <div>
                        <h1 className='text-18 font-ibm-plex-serif font-bold text-black-1'>Upscale Banking</h1>
                    </div>
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
