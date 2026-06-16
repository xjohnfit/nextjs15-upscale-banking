'use client';

import { logoutAccount } from '@/lib/actions/user.actions';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

const Footer = ({ user, type = 'desktop' }: FooterProps) => {
    const router = useRouter();

    const handleLogOut = async () => {
        await logoutAccount();
        router.push('/sign-in');
    };

    return (
        <footer className='footer'>
            <div className={type === 'mobile' ? 'footer_name-mobile' : 'footer_name'}>
                <p className='text-xl font-bold text-white'>
                    {user?.firstName[0]}
                </p>
            </div>

            <div className={type === 'mobile' ? 'footer_email-mobile' : 'footer_email'}>
                <h1 className='text-14 truncate text-black-1 font-semibold'>
                    {user?.firstName}
                </h1>
                <p className='text-14 truncate font-normal text-gray-600'>
                    {user?.email}
                </p>
            </div>

            <button
                onClick={handleLogOut}
                className='footer_image'
                aria-label='Log out'>
                <Image
                    src='/icons/logout.svg'
                    fill
                    alt='Log out'
                />
            </button>
        </footer>
    );
};

export default Footer;
