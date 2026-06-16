import Image from 'next/image';
import BankCard from './BankCard';
import { countTransactionCategories } from '@/lib/utils';
import Category from './Category';
import PlaidLink from './PlaidLink';

const RightSidebar = ({ user, transactions, banks }: RightSidebarProps) => {
    const categories: CategoryCount[] =
        countTransactionCategories(transactions);

    return (
        <aside className='right-sidebar'>
            {/* Profile card */}
            <section className='px-5 pt-6 pb-3'>
                <div className='flex items-center gap-3 rounded-2xl border border-violet-100 bg-gradient-to-br from-violet-25 to-blue-25 p-4'>
                    <div className='flex-center size-11 shrink-0 rounded-full bg-bank-gradient'>
                        <span className='text-lg font-bold text-white'>
                            {user.firstName[0]}
                        </span>
                    </div>
                    <div className='min-w-0 flex-1'>
                        <h1 className='truncate text-[15px] font-semibold text-black-1'>
                            {user.firstName} {user.lastName}
                        </h1>
                        <p className='truncate text-[13px] text-gray-500'>
                            {user.email}
                        </p>
                    </div>
                </div>
            </section>

            {/* Divider */}
            <div className='mx-5 border-t border-violet-100' />

            {/* Banks */}
            <section className='banks'>
                <div className='flex w-full items-center justify-between'>
                    <h2 className='header-2'>My Banks</h2>
                    {banks?.length > 0 && (
                        <PlaidLink user={user} variant='ghost' type='add' />
                    )}
                </div>

                {banks?.length > 0 ? (
                    <div className='relative flex min-h-[220px] flex-col items-center'>
                        <div className='relative z-10 w-full'>
                            <BankCard
                                key={banks[0].$id}
                                account={banks[0]}
                                userName={`${user.firstName} ${user.lastName}`}
                                showBalance={false}
                            />
                        </div>
                        {banks[1] && (
                            <div className='absolute right-0 top-8 z-0 w-[90%]'>
                                <BankCard
                                    key={banks[1].$id}
                                    account={banks[1]}
                                    userName={`${user.firstName} ${user.lastName}`}
                                    showBalance={false}
                                />
                            </div>
                        )}
                    </div>
                ) : (
                    <div className='rounded-2xl border-2 border-dashed border-violet-200 bg-gradient-to-br from-violet-25 to-violet-50 p-5'>
                        <div className='flex flex-col items-center text-center'>
                            <div className='mb-3 flex size-11 items-center justify-center rounded-full bg-violet-100'>
                                <Image
                                    src='/icons/connect-bank.svg'
                                    width={22}
                                    height={22}
                                    alt='Connect Bank'
                                />
                            </div>
                            <h3 className='mb-1 text-[14px] font-semibold text-gray-900'>
                                No banks connected
                            </h3>
                            <p className='mb-4 text-[13px] text-gray-500'>
                                Securely link your bank to view balances and track transactions.
                            </p>
                            <PlaidLink
                                user={user}
                                variant='primary'
                                type='connect'
                            />
                        </div>
                    </div>
                )}
            </section>

            {/* Top Categories */}
            {categories.length > 0 && (
                <>
                    <div className='mx-5 border-t border-violet-100' />
                    <section className='px-5 py-5'>
                        <h2 className='header-2 mb-4'>Top Categories</h2>
                        <div className='space-y-3'>
                            {categories.map((category, index) => (
                                <Category key={index} category={category} />
                            ))}
                        </div>
                    </section>
                </>
            )}
        </aside>
    );
};

export default RightSidebar;
