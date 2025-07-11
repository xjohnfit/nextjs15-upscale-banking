import HeaderBox from '@/components/HeaderBox';
import RecentTransactions from '@/components/RecentTransactions';
import RightSidebar from '@/components/RightSidebar';
import TotalBalanceBox from '@/components/TotalBalanceBox';
import SessionHandler from '@/components/SessionHandler';
import PlaidLink from '@/components/PlaidLink';
import { getAccount, getAccounts } from '@/lib/actions/bank.actions';
import { getLoggedInUser } from '@/lib/actions/user.actions';

const Home = async (props: SearchParamProps) => {
    const searchParams = props.searchParams;

    const { id, page } = await searchParams;

    const currentPage = Number(page as string) || 1;

    try {
        const loggedIn = await getLoggedInUser();

        if (!loggedIn) {
            return (
                <SessionHandler showLogout={true}>
                    <section className='home'>
                        <div className='home-content'>
                            <header className='home-header'>
                                <HeaderBox
                                    type='greeting'
                                    title='Welcome'
                                    user='Guest'
                                    subtext='Please sign in to access your banking dashboard.'
                                />
                            </header>
                        </div>
                    </section>
                </SessionHandler>
            );
        }

        const accounts = await getAccounts({
            userId: loggedIn.$id,
        });

        if (!accounts) {
            return (
                <section className='home'>
                    <div className='home-content'>
                        <header className='home-header'>
                            <HeaderBox
                                type='greeting'
                                title='Welcome to Upscale Banking'
                                user={loggedIn?.firstName || 'Guest'}
                                subtext='Get started by connecting your first bank account. You can link your bank securely using Plaid.'
                            />

                            <div className='mt-8 p-8 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200 text-center'>
                                <div className='w-20 h-20 mx-auto mb-6 bg-blue-100 rounded-full flex items-center justify-center'>
                                    <svg
                                        className='w-10 h-10 text-blue-600'
                                        fill='currentColor'
                                        viewBox='0 0 20 20'>
                                        <path
                                            fillRule='evenodd'
                                            d='M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z'
                                            clipRule='evenodd'
                                        />
                                    </svg>
                                </div>
                                <h3 className='text-2xl font-bold text-gray-900 mb-4'>
                                    🏦 Connect Your First Bank Account
                                </h3>
                                <p className='text-gray-700 mb-6 max-w-md mx-auto'>
                                    Securely connect your bank account using
                                    Plaid to start managing your finances, view
                                    account balances, and track transactions.
                                </p>
                                <div className='flex flex-col items-center gap-4'>
                                    <PlaidLink
                                        user={loggedIn}
                                        variant='primary'
                                        type='connect'
                                    />
                                    <div className='text-sm text-gray-600 space-y-1'>
                                        <div className='flex items-center justify-center gap-2'>
                                            <span className='text-green-500'>
                                                ✅
                                            </span>
                                            <span>
                                                Bank-level security with Plaid
                                            </span>
                                        </div>
                                        <div className='flex items-center justify-center gap-2'>
                                            <span className='text-green-500'>
                                                ✅
                                            </span>
                                            <span>Real-time account data</span>
                                        </div>
                                        <div className='flex items-center justify-center gap-2'>
                                            <span className='text-green-500'>
                                                ✅
                                            </span>
                                            <span>
                                                Transaction history & analytics
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </header>
                    </div>

                    <RightSidebar
                        user={loggedIn}
                        transactions={[]}
                        banks={[]}
                    />
                </section>
            );
        }

        const accountsData = accounts?.data;
        const appwriteItemId =
            (id as string) || accountsData[0]?.appwriteItemId;

        if (!appwriteItemId) {
            // Return home page without account data, but include PlaidLink for connecting
            return (
                <section className='home'>
                    <div className='home-content'>
                        <header className='home-header'>
                            <HeaderBox
                                type='greeting'
                                title='Welcome'
                                user={loggedIn?.firstName || 'Guest'}
                                subtext='Connect a bank account to start viewing your financial dashboard.'
                            />

                            <TotalBalanceBox
                                accounts={accountsData}
                                totalBanks={accounts?.totalBanks}
                                totalCurrentBalance={
                                    accounts?.totalCurrentBalance
                                }
                            />

                            {/* Add prominent PlaidLink section for users with no connected accounts */}
                            <div className='mt-6 p-6 bg-yellow-50 rounded-xl border border-yellow-200'>
                                <div className='flex items-center gap-4'>
                                    <div className='w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center'>
                                        <svg
                                            className='w-6 h-6 text-yellow-600'
                                            fill='currentColor'
                                            viewBox='0 0 20 20'>
                                            <path
                                                fillRule='evenodd'
                                                d='M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z'
                                                clipRule='evenodd'
                                            />
                                        </svg>
                                    </div>
                                    <div className='flex-1'>
                                        <h3 className='text-lg font-semibold text-yellow-800 mb-1'>
                                            No Connected Bank Accounts
                                        </h3>
                                        <p className='text-yellow-700 text-sm mb-3'>
                                            You need to connect at least one
                                            bank account to view your financial
                                            data and manage transactions.
                                        </p>
                                        <PlaidLink
                                            user={loggedIn}
                                            variant='primary'
                                            type='connect'
                                        />
                                    </div>
                                </div>
                            </div>
                        </header>
                    </div>

                    <RightSidebar
                        user={loggedIn}
                        transactions={[]}
                        banks={accountsData?.slice(0, 2)}
                    />
                </section>
            );
        }

        const account = await getAccount({ appwriteItemId });

        return (
            <section className='home'>
                <div className='home-content'>
                    <header className='home-header'>
                        <HeaderBox
                            type='greeting'
                            title='Welcome'
                            user={loggedIn?.firstName || 'Guest'}
                            subtext='Access and manage your account and transactions efficiently.'
                        />

                        <TotalBalanceBox
                            accounts={accountsData}
                            totalBanks={accounts?.totalBanks}
                            totalCurrentBalance={accounts?.totalCurrentBalance}
                        />
                    </header>

                    <RecentTransactions
                        accounts={accountsData}
                        transactions={account?.transactions}
                        appwriteItemId={appwriteItemId}
                        page={currentPage}
                    />
                </div>

                <RightSidebar
                    user={loggedIn}
                    transactions={account?.transactions}
                    banks={accountsData?.slice(0, 2)}
                />
            </section>
        );
    } catch (error) {
        console.error('Error loading home page:', error);
        return (
            <SessionHandler showLogout={true}>
                <section className='home'>
                    <div className='home-content'>
                        <header className='home-header'>
                            <HeaderBox
                                type='greeting'
                                title='Welcome'
                                user='Guest'
                                subtext='Unable to load banking data. This might be due to an invalid session.'
                            />
                            <div className='mt-4 p-4 bg-red-50 rounded-lg border border-red-200'>
                                <p className='text-red-800 text-sm'>
                                    ⚠️ Session Error: Unable to verify your
                                    authentication. Please clear your session
                                    and sign in again.
                                </p>
                            </div>
                        </header>
                    </div>
                </section>
            </SessionHandler>
        );
    }
};

export default Home;
