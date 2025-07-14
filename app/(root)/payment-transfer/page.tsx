import HeaderBox from '@/components/HeaderBox';
import PaymentTransferForm from '@/components/PaymentTransferForm';
import { getAccounts } from '@/lib/actions/bank.actions';
import { getLoggedInUser } from '@/lib/actions/user.actions';
import React from 'react';

const Transfer = async () => {
    try {
        const loggedIn = await getLoggedInUser();

        if (!loggedIn) {
            return (
                <section className='payment-transfer'>
                    <HeaderBox
                        title='Payment Transfer'
                        subtext='Please sign in to access payment transfer functionality'
                    />
                </section>
            );
        }

        const accounts = await getAccounts({
            userId: loggedIn.$id,
        });

        if (!accounts) {
            return (
                <section className='payment-transfer'>
                    <HeaderBox
                        title='Payment Transfer'
                        subtext='No bank accounts found. Please connect a bank account to transfer funds.'
                    />
                </section>
            );
        }

        const accountsData = accounts?.data;

        return (
            <section className='payment-transfer'>
                <HeaderBox
                    title='Payment Transfer'
                    subtext='Please provide any specific details or notes related to the payment transfer'
                />

                <section className='size-full pt-5'>
                    <PaymentTransferForm accounts={accountsData} />
                </section>
            </section>
        );
    } catch (error) {
        return (
            <section className='payment-transfer'>
                <HeaderBox
                    title='Payment Transfer'
                    subtext='Unable to load payment transfer. Please try again later.'
                />
            </section>
        );
    }
};

export default Transfer;
