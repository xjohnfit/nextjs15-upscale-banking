'use client';

import React, { useCallback, useEffect, useState } from 'react';
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

const PlaidLink = ({ user, variant, type, onSheetClose }: PlaidLinkProps) => {
    const router = useRouter();

    const [token, setToken] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const getLinkToken = async () => {
            try {
                console.log('Creating Plaid link token for user:', user.$id);
                const data = await createLinkToken(user);

                if (data?.linkToken) {
                    setToken(data.linkToken);
                    console.log('Plaid link token created successfully');
                } else {
                    console.error('Failed to create Plaid link token');
                }
            } catch (error) {
                console.error('Error creating Plaid link token:', error);
            }
        };

        if (user) {
            getLinkToken();
        }
    }, [user]);

    const onSuccess = useCallback<PlaidLinkOnSuccess>(
        async (public_token: string, metadata) => {
            try {
                setLoading(true);
                console.log('Plaid Link success:', { public_token, metadata });

                await exchangePublicToken({
                    publicToken: public_token,
                    user,
                });

                console.log('Bank account linked successfully');
                // Redirect to dashboard after successful bank linking
                router.push('/');
            } catch (error) {
                console.error('Error linking bank account:', error);
                // Still redirect to dashboard even if there's an error
                router.push('/');
            } finally {
                setLoading(false);
            }
        },
        [user, router]
    );

    const onExit = useCallback<PlaidLinkOnExit>((err, metadata) => {
        console.log('Plaid Link exit:', { err, metadata });
        if (err != null) {
            console.error('Plaid Link error:', err);
        }
    }, []);

    const onEvent = useCallback<PlaidLinkOnEvent>((eventName, metadata) => {
        console.log('Plaid Link event:', { eventName, metadata });
    }, []);

    const config: PlaidLinkOptions = {
        token,
        onSuccess,
        onExit,
        onEvent,
        env: (process.env.PLAID_ENV as any) || 'sandbox',
        // Additional configuration for better stability
        receivedRedirectUri: undefined,
    };

    const { open, ready, error } = usePlaidLink(config);

    const handleClick = () => {
        console.log('handleClick called - ready:', ready, 'loading:', loading, 'token:', !!token);
        if (ready && !loading) {
            console.log('Opening Plaid Link...');
            open();
        } else {
            console.log('Plaid Link not ready or currently loading');
        }
    };

    // Show error state if there's an issue with Plaid Link
    if (error) {
        console.error('Plaid Link error:', error);
    }

    const isDisabled = !ready || loading || !token;

    return (
        <>
            {variant === 'primary' ? (
                <Button
                    onClick={handleClick}
                    disabled={isDisabled}
                    className='plaidlink-primary'>
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
            ) : variant === 'mobile-nav' ? (
                <Button
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        if (ready && !loading && token) {
                            console.log('PlaidLink mobile-nav clicked, closing sheet and opening Plaid...');
                            // Close the mobile navigation sheet first
                            if (onSheetClose) {
                                onSheetClose();
                            }
                            // Small delay to allow sheet to close before opening Plaid
                            setTimeout(() => {
                                handleClick();
                            }, 100);
                        } else {
                            console.log('PlaidLink not ready:', { ready, loading, hasToken: !!token });
                        }
                    }}
                    disabled={isDisabled}
                    className='mobilenav-sheet_close w-full !justify-start !bg-bank-gradient hover:!bg-bank-gradient cursor-pointer'
                    type='button'>
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
