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
import { useState } from 'react';
import Footer from './Footer';
import PlaidLink from './PlaidLink';

const MobileNav = ({ user }: MobileNavProps) => {
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(false);

    return (
        <section className='w-full max-w-[264px]'>
            <Sheet
                open={isOpen}
                onOpenChange={setIsOpen}>
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
                    className='border-none bg-white flex flex-col h-full'>
                    <Link
                        href='/'
                        className='cursor-pointer flex items-center gap-5 px-4 py-4 border-b border-gray-100'>
                        <Image
                            src='/icons/logo.svg'
                            width={34}
                            height={34}
                            alt='Upscale logo'
                        />
                        <h1 className='text-18 font-ibm-plex-serif font-bold text-black-1'>
                            Upscale Banking
                        </h1>
                    </Link>

                    {/* Scrollable content area */}
                    <div className='flex-1 overflow-y-auto'>
                        <SheetClose asChild>
                            <nav className='flex flex-col gap-2 p-4'>
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
                                                        'bg-bank-gradient':
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
                                                        'text-16 font-semibold text-black-2',
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

                        <div className='px-4 pb-4'>
                            <div
                                onClick={(e) => {
                                    e.stopPropagation();
                                    e.preventDefault();
                                }}
                                onMouseDown={(e) => e.stopPropagation()}
                                onTouchStart={(e) => e.stopPropagation()}
                                style={{ isolation: 'isolate' }}>
                                <PlaidLink
                                    user={user}
                                    variant='mobile-nav'
                                    type='mobile'
                                    onSheetClose={() => setIsOpen(false)}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Fixed footer at bottom */}
                    <div className='border-t border-gray-100 p-4'>
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
