'use client';

import {
    Sheet,
    SheetClose,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from '@/components/ui/sheet';
import { sidebarLinks } from '@/constants';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Footer from './Footer';
import PlaidLink from './PlaidLink';

const MobileNav = ({ user }: MobileNavProps) => {
    const pathname = usePathname();

    return (
        <section className='w-full max-w-[264px]'>
            <Sheet>
                <SheetTrigger>
                    <Image
                        src='/icons/hamburger.svg'
                        width={30}
                        height={30}
                        alt='menu'
                        className='cursor-pointer'
                    />
                </SheetTrigger>
                <SheetContent
                    side='left'
                    className='border-none flex flex-col h-full p-0 overflow-hidden'
                    style={{ background: 'linear-gradient(175deg, #EDE9FE 0%, #F8F7FF 15%, #FFFFFF 35%)' }}>
                    <Link
                        href='/'
                        className='cursor-pointer flex items-center gap-3 px-5 py-5'>
                        <Image
                            src='/icons/upscale-banking-logo.png'
                            width={88}
                            height={88}
                            alt='Upscale logo'
                            className='size-[88px] shrink-0'
                        />
                        <h1 className='text-[22px] font-ibm-plex-serif font-bold bg-bank-gradient bg-clip-text text-transparent'>
                            Upscale Banking
                        </h1>
                    </Link>

                    {/* Scrollable content area */}
                    <div className='flex-1 overflow-y-auto'>
                        <SheetClose asChild>
                            <nav className='flex flex-col gap-1 px-3 py-2'>
                                {sidebarLinks.map((item) => {
                                    const isActive =
                                        pathname === item.route ||
                                        pathname.startsWith(`${item.route}/`);

                                    return (
                                        <SheetClose
                                            asChild
                                            key={item.route}>
                                            <Link
                                                href={item.route}
                                                key={item.label}
                                                className={cn(
                                                    'mobilenav-sheet_close w-full',
                                                    {
                                                        'bg-bank-gradient shadow-brand':
                                                            isActive,
                                                    }
                                                )}>
                                                <Image
                                                    src={item.imgURL}
                                                    alt={item.label}
                                                    width={20}
                                                    height={20}
                                                    className={cn({
                                                        'brightness-[3] invert-0':
                                                            isActive,
                                                    })}
                                                />
                                                <p
                                                    className={cn(
                                                        'text-[15px] font-semibold text-gray-600',
                                                        {
                                                            'text-white':
                                                                isActive,
                                                        }
                                                    )}>
                                                    {item.label}
                                                </p>
                                            </Link>
                                        </SheetClose>
                                    );
                                })}
                            </nav>
                        </SheetClose>

                    </div>

                    {/* Fixed footer at bottom */}
                    <div className='border-t border-violet-100 px-5 py-4'>
                        <Footer
                            user={user}
                            type='mobile'
                        />
                    </div>
                </SheetContent>
            </Sheet>
        </section>
    );
};

export default MobileNav;
