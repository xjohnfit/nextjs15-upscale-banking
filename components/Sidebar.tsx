'use client';

import { sidebarLinks } from '@/constants';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Footer from './Footer';
import PlaidLink from './PlaidLink';

const Sidebar = ({ user }: SidebarProps) => {
    const pathname = usePathname();

    return (
        <section className='sidebar'>
            <div className='flex flex-col h-full'>
                <div className='flex-1 overflow-y-auto'>
                    <nav className='flex flex-col gap-4'>
                        <Link
                            href='/'
                            className='mb-12 cursor-pointer flex items-center gap-2'>
                            <Image
                                src='/icons/logo.svg'
                                width={34}
                                height={34}
                                alt='Upscale logo'
                                className='size-[24px] max-xl:size-14'
                            />
                            <h1 className='sidebar-logo'>Upscale Banking</h1>
                        </Link>

                        {sidebarLinks.map((item, index) => {
                            const isActive =
                                pathname === item.route ||
                                pathname.startsWith(`${item.route}/`);

                            return (
                                <Link
                                    href={item.route}
                                    key={index}
                                    className={cn('sidebar-link', {
                                        'bg-bank-gradient': isActive,
                                    })}>
                                    <div className='relative size-6'>
                                        <Image
                                            src={item.imgURL}
                                            alt={item.label}
                                            fill
                                            className={cn({
                                                'brightness-[3] invert-0':
                                                    isActive,
                                            })}
                                        />
                                    </div>
                                    <p
                                        className={cn('sidebar-label', {
                                            '!text-white': isActive,
                                        })}>
                                        {item.label}
                                    </p>
                                </Link>
                            );
                        })}

                        <PlaidLink
                            user={user}
                            type='desktop'
                            variant='primary'
                        />
                    </nav>
                </div>

                <div className='mt-auto'>
                    <Footer user={user} />
                </div>
            </div>
        </section>
    );
};

export default Sidebar;
