'use client';

import Image from 'next/image';
import Link from 'next/link';
import React, { useState, useEffect } from 'react';

import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import CustomInput from './CustomInput';
import { authFormSchema } from '@/lib/utils';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import {
    signIn,
    signUp,
    clearInvalidSession,
} from '@/lib/actions/user.actions';
import {
    forceRedirectAfterAuth,
    simpleRedirectAfterAuth,
} from '@/lib/redirect-utils';
import { toast } from 'sonner';
import PlaygroundInfo from './PlaygroundInfo';

const AuthForm = ({ type }: { type: string }) => {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    // Clear any invalid session on component mount
    useEffect(() => {
        const clearSession = async () => {
            try {
                await clearInvalidSession();
            } catch (error) {
                // No session to clear or error clearing session
            }
        };

        clearSession();
    }, []);

    const formSchema = authFormSchema(type);

    // 1. Define your form.
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: '',
            password: '',
        },
    });

    // 2. Define a submit handler.
    const onSubmit = async (data: z.infer<typeof formSchema>) => {
        setIsLoading(true);

        try {
            // Sign up with Appwrite & create plaid token

            if (type === 'sign-up') {
                try {
                    const userData = {
                        firstName: data.firstName!,
                        lastName: data.lastName!,
                        address1: data.address1!,
                        city: data.city!,
                        state: data.state!,
                        postalCode: data.postalCode!,
                        dateOfBirth: data.dateOfBirth!,
                        ssn: data.ssn!,
                        email: data.email,
                        password: data.password,
                    };

                    const newUser = await signUp(userData);

                    if (!newUser) {
                        toast.error(
                            'Failed to create account. Please try again.'
                        );
                        return;
                    } else {
                        toast.success(
                            'Account created successfully!'
                        );

                        // Try the robust redirect first, with simple fallback
                        try {
                            await forceRedirectAfterAuth();
                        } catch (redirectError) {
                            simpleRedirectAfterAuth();
                        }
                    }
                } catch (signUpError) {
                    toast.error('Failed to create account. Please try again.');
                }
            }

            if (type === 'sign-in') {
                try {
                    const response = await signIn({
                        email: data.email,
                        password: data.password,
                    });

                    if (response) {
                        toast.success(
                            'Successfully signed in!'
                        );

                        // Try the robust redirect first, with simple fallback
                        try {
                            await forceRedirectAfterAuth();
                        } catch (redirectError) {
                            simpleRedirectAfterAuth();
                        }
                    } else {
                        toast.error(
                            'Invalid email or password. Please try again.'
                        );
                    }
                } catch (signInError) {
                    toast.error('Sign in failed. Please try again.');
                }
            }
        } catch (error) {
            if (type === 'sign-up') {
                toast.error('Failed to create account. Please try again.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <section className='auth-form'>
            <header className='flex flex-col gap-5 md:gap-8'>
                <Link
                    href='/'
                    className='cursor-pointer flex items-center gap-1 justify-center'>
                    <Image
                        src='/icons/logo.svg'
                        width={30}
                        height={30}
                        alt='Upscale logo'
                    />
                    <h1 className='text-26 font-ibm-plex-serif font-bold text-black-1'>
                        Upscale Banking
                    </h1>
                </Link>

                <div className='flex flex-col gap-1 md:gap-3'>
                    <h1 className='text-24 lg:text-36 font-semibold text-gray-900'>
                        {type === 'sign-in' ? 'Sign In' : 'Sign Up'}
                        <p className='text-16 font-normal text-gray-600'>
                            Please enter your details
                        </p>
                    </h1>
                </div>
            </header>
            <Form {...form}>
                <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className='space-y-8'>
                    {type === 'sign-up' && (
                        <>
                            <div className='flex gap-4'>
                                <CustomInput
                                    control={form.control}
                                    name='firstName'
                                    label='First Name'
                                    placeholder='Enter your first name'
                                />
                                <CustomInput
                                    control={form.control}
                                    name='lastName'
                                    label='Last Name'
                                    placeholder='Enter your first name'
                                />
                            </div>
                            <CustomInput
                                control={form.control}
                                name='address1'
                                label='Address'
                                placeholder='Enter your specific address'
                            />
                            <CustomInput
                                control={form.control}
                                name='city'
                                label='City'
                                placeholder='Enter your city'
                            />
                            <div className='flex gap-4'>
                                <CustomInput
                                    control={form.control}
                                    name='state'
                                    label='State'
                                    placeholder='Example: NY'
                                />
                                <CustomInput
                                    control={form.control}
                                    name='postalCode'
                                    label='Postal Code'
                                    placeholder='Example: 11101'
                                />
                            </div>
                            <div className='flex gap-4'>
                                <CustomInput
                                    control={form.control}
                                    name='dateOfBirth'
                                    label='Date of Birth'
                                    placeholder='YYYY-MM-DD'
                                />
                                <CustomInput
                                    control={form.control}
                                    name='ssn'
                                    label='SSN'
                                    placeholder='Example: 1234'
                                />
                            </div>
                        </>
                    )}

                    <CustomInput
                        control={form.control}
                        name='email'
                        label='Email'
                        placeholder='Enter your email'
                    />

                    <CustomInput
                        control={form.control}
                        name='password'
                        label='Password'
                        placeholder='Enter your password'
                    />

                    <div className='flex flex-col gap-4'>
                        <Button
                            type='submit'
                            disabled={isLoading}
                            className='form-btn'>
                            {isLoading ? (
                                <>
                                    <Loader2
                                        size={20}
                                        className='animate-spin'
                                    />{' '}
                                    &nbsp; Loading...
                                </>
                            ) : type === 'sign-in' ? (
                                'Sign In'
                            ) : (
                                'Sign Up'
                            )}
                        </Button>
                    </div>
                </form>
            </Form>

            <footer className='flex justify-center gap-1'>
                <p className='text-14 font-normal text-gray-600'>
                    {type === 'sign-in'
                        ? "Don't have an account?"
                        : 'Already have an account?'}
                </p>
                <Link
                    href={type === 'sign-in' ? '/sign-up' : '/sign-in'}
                    className='form-link'>
                    {type === 'sign-in' ? 'Sign up' : 'Sign in'}
                </Link>
            </footer>
            <PlaygroundInfo />
        </section>
    );
};

export default AuthForm;
