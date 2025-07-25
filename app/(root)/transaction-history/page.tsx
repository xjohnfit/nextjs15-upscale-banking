import HeaderBox from '@/components/HeaderBox';
import { Pagination } from '@/components/Pagination';
import TransactionsTable from '@/components/TransactionsTable';
import { getAccount, getAccounts } from '@/lib/actions/bank.actions';
import { getLoggedInUser } from '@/lib/actions/user.actions';
import { formatAmount } from '@/lib/utils';
import React from 'react';

const TransactionHistory = async (props: SearchParamProps) => {
    const searchParams = await props.searchParams;

    const { id, page } = searchParams;

    const currentPage = Number(page as string) || 1;

    try {
        const loggedIn = await getLoggedInUser();

        if (!loggedIn) {
            return (
                <div className='transactions'>
                    <div className='transactions-header'>
                        <HeaderBox
                            title='Transaction History'
                            subtext='Please sign in to view your transaction history.'
                        />
                    </div>
                </div>
            );
        }

        const accounts = await getAccounts({
            userId: loggedIn.$id,
        });

        if (!accounts || !accounts.data || accounts.data.length === 0) {
            return (
                <div className='transactions'>
                    <div className='transactions-header'>
                        <HeaderBox
                            title='Transaction History'
                            subtext='No bank accounts found. Please connect a bank account to view transactions.'
                        />
                    </div>
                </div>
            );
        }

        const accountsData = accounts?.data;
        const appwriteItemId =
            (id as string) || accountsData[0]?.appwriteItemId;

        const account = await getAccount({ appwriteItemId });

        if (!account || !account.transactions) {
            return (
                <div className='transactions'>
                    <div className='transactions-header'>
                        <HeaderBox
                            title='Transaction History'
                            subtext='No transactions found for this account.'
                        />
                    </div>
                </div>
            );
        }

        const rowsPerPage = 10;
        const totalPages = Math.ceil(
            account?.transactions.length / rowsPerPage
        );

        const indexOfLastTransaction = currentPage * rowsPerPage;
        const indexOfFirstTransaction = indexOfLastTransaction - rowsPerPage;

        const currentTransactions = account?.transactions.slice(
            indexOfFirstTransaction,
            indexOfLastTransaction
        );

        return (
            <div className='transactions'>
                <div className='transactions-header'>
                    <HeaderBox
                        title='Transaction History'
                        subtext='See your bank details and transactions.'
                    />
                </div>

                <div className='space-y-6'>
                    <div className='transactions-account'>
                        <div className='flex flex-col gap-2'>
                            <h2 className='text-18 font-bold text-white'>
                                {account?.data.name}
                            </h2>
                            <p className='text-14 text-blue-25'>
                                {account?.data.officialName}
                            </p>
                            <p className='text-14 font-semibold tracking-[1.1px] text-white'>
                                ●●●● ●●●● ●●●● {account?.data.mask}
                            </p>
                        </div>

                        <div className='transactions-account-balance'>
                            <p className='text-14'>Current balance</p>
                            <p className='text-24 text-center font-bold'>
                                {formatAmount(account?.data.currentBalance)}
                            </p>
                        </div>
                    </div>

                    <section className='flex w-full flex-col gap-6'>
                        <TransactionsTable transactions={currentTransactions} />
                        {totalPages > 1 && (
                            <div className='my-4 w-full'>
                                <Pagination
                                    totalPages={totalPages}
                                    page={currentPage}
                                />
                            </div>
                        )}
                    </section>
                </div>
            </div>
        );
    } catch (error) {
        return (
            <div className='transactions'>
                <div className='transactions-header'>
                    <HeaderBox
                        title='Transaction History'
                        subtext='Unable to load transaction history. Please try again later.'
                    />
                </div>
            </div>
        );
    }
};

export default TransactionHistory;
