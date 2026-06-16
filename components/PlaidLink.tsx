'use client';

import { useCallback, useEffect, useState } from 'react';
import { Button } from './ui/button';
import {
    PlaidLinkOnSuccess,
    PlaidLinkOnExit,
    PlaidLinkError,
    PlaidLinkOnEvent,
    PlaidLinkOptions,
    usePlaidLink,
} from 'react-plaid-link';
import { useRouter } from 'next/navigation';
import {
    createLinkToken,
    exchangePublicToken,
} from '@/lib/actions/user.actions';
import Image from 'next/image';

const PlaidLink = ({ user, variant, type }: PlaidLinkProps) => {
    const router = useRouter();

    const [token, setToken] = useState('');
    const [loading, setLoading] = useState(false);
    const [linkError, setLinkError] = useState<string | null>(null);

    useEffect(() => {
        const getLinkToken = async () => {
            try {
                const data = await createLinkToken(user);

                if (data?.linkToken) {
                    setToken(data.linkToken);
                }
            } catch (error) {
                // Failed to create link token
            }
        };

        if (user) {
            getLinkToken();
        }
    }, [user]);

    const onSuccess = useCallback<PlaidLinkOnSuccess>(
        async (public_token: string) => {
            try {
                setLoading(true);

                await exchangePublicToken({
                    publicToken: public_token,
                    user,
                });

                router.refresh();
            } catch (error: any) {
                const msg = error?.message ?? 'Unknown error linking bank account';
                setLinkError(msg);
                setLoading(false);
                return;
            } finally {
                setLoading(false);
            }
        },
        [user]
    );

    const onExit = useCallback<PlaidLinkOnExit>(() => {}, []);

    const onEvent = useCallback<PlaidLinkOnEvent>(() => {}, []);

    const config: PlaidLinkOptions = {
        token,
        onSuccess,
        onExit,
        onEvent,
        env: (process.env.PLAID_ENV as any) || 'sandbox',
        // Explicitly set to undefined to prevent OAuth redirects and keep within modal
        receivedRedirectUri: undefined,
    };

    const { open, ready, error } = usePlaidLink(config);

    const handleClick = () => {
        if (!token || !ready || loading) return;
        open();
    };

    if (error) {
        return (
            <Button
                disabled
                className={variant === 'ghost' ? 'bg-white' : ''}>
                Link Unavailable
            </Button>
        );
    }

    if (linkError) {
        return (
            <div className='flex flex-col gap-2'>
                <p className='text-sm text-red-600 font-medium'>Bank linking failed: {linkError}</p>
                <Button onClick={() => setLinkError(null)} variant='outline' className='text-sm'>
                    Try again
                </Button>
            </div>
        );
    }

    const isDisabled = !ready || loading || !token;

    return (
        <>
            {variant === 'primary' ? (
                <Button
                    onClick={handleClick}
                    disabled={isDisabled}
                    className='plaidlink-primary'
                    style={{ touchAction: 'manipulation' }}>
                    {loading
                        ? 'Connecting...'
                        : ready
                        ? 'Connect bank'
                        : 'Loading...'}
                </Button>
            ) : variant === 'ghost' ? (
                <Button
                    onClick={handleClick}
                    disabled={isDisabled}
                    variant='ghost'
                    className='plaidlink-ghost'>
                    {type === 'add' ? (
                        <>
                            <span className='text-base leading-none'>+</span>
                            <span>{loading ? 'Adding...' : 'Add bank'}</span>
                        </>
                    ) : (
                        <>
                            <Image
                                src='/icons/connect-bank.svg'
                                alt='connect bank'
                                width={16}
                                height={16}
                            />
                            <span>{loading ? 'Connecting...' : ready ? 'Connect Bank' : 'Loading...'}</span>
                        </>
                    )}
                </Button>
            ) : variant === 'mobile-nav' ? (
                <Button
                    onClick={handleClick}
                    disabled={isDisabled}
                    className='mobilenav-sheet_close w-full !justify-start !bg-bank-gradient hover:!bg-bank-gradient cursor-pointer'>
                    <Image
                        src='/icons/connect-bank.svg'
                        alt='Connect Bank'
                        width={20}
                        height={20}
                        className='brightness-[3] invert-0'
                    />
                    <p className='text-16 font-semibold text-white'>
                        {loading
                            ? 'Connecting...'
                            : ready
                            ? 'Connect Bank'
                            : 'Loading...'}
                    </p>
                </Button>
            ) : (
                <Button
                    onClick={handleClick}
                    disabled={isDisabled}
                    className='plaidlink-default'>
                    <Image
                        src='/icons/connect-bank.svg'
                        alt='connect bank'
                        width={24}
                        height={24}
                    />
                    <p className='sm:block md:hidden lg:hidden xl:block text-[16px] font-semibold text-black-2'>
                        {loading
                            ? 'Connecting...'
                            : ready
                            ? 'Connect Bank'
                            : 'Loading...'}
                    </p>
                </Button>
            )}
        </>
    );
};

export default PlaidLink;
