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

    const isMobile = type === 'mobile';

    return (
        <div className={isMobile ? 'footer-mobile' : 'footer-desktop'}>
            <div className={isMobile ? 'footer_name-mobile' : 'footer_name'}>
                <p className='text-sm font-bold text-white leading-none'>
                    {user?.firstName[0]}
                </p>
            </div>

            <div className={isMobile ? 'footer_email-mobile' : 'footer_email'}>
                <p className='text-sm font-semibold text-gray-800 truncate'>
                    {user?.firstName}
                </p>
                <p className='text-xs text-gray-500 truncate'>
                    {user?.email}
                </p>
            </div>

            <button
                onClick={handleLogOut}
                className='footer_logout'
                aria-label='Log out'>
                <Image
                    src='/icons/logout.svg'
                    width={18}
                    height={18}
                    alt='Log out'
                />
            </button>
        </div>
    );
};

export default Footer;
