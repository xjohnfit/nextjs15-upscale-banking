import BankCard from '@/components/BankCard';
import HeaderBox from '@/components/HeaderBox'
import { getAccounts } from '@/lib/actions/bank.actions';
import { getLoggedInUser } from '@/lib/actions/user.actions';
import React from 'react'

const MyBanks = async () => {
  try {
    const loggedIn = await getLoggedInUser();
    
    if (!loggedIn) {
      return (
        <section className='flex'>
          <div className="my-banks">
            <HeaderBox 
              title="My Bank Accounts"
              subtext="Please sign in to view your bank accounts."
            />
          </div>
        </section>
      );
    }

    const accounts = await getAccounts({ 
      userId: loggedIn.$id 
    })

    if (!accounts || !accounts.data || accounts.data.length === 0) {
      return (
        <section className='flex'>
          <div className="my-banks">
            <HeaderBox 
              title="My Bank Accounts"
              subtext="No bank accounts found. Connect a bank account to get started."
            />
            <div className="space-y-4">
              <h2 className="header-2">
                Your cards
              </h2>
              <div className="flex flex-wrap gap-6">
                <p className="text-gray-500">No bank accounts connected yet.</p>
              </div>
            </div>
          </div>
        </section>
      );
    }

    return (
      <section className='flex'>
        <div className="my-banks">
          <HeaderBox 
            title="My Bank Accounts"
            subtext="Effortlessly manage your banking activities."
          />

          <div className="space-y-4">
            <h2 className="header-2">
              Your cards
            </h2>
            <div className="flex flex-wrap gap-6">
              {accounts.data.map((a: Account) => (
                <BankCard 
                  key={a.id}
                  account={a}
                  userName={loggedIn?.firstName}
                />
              ))}
            </div>
          </div>
        </div>
      </section>
    )
  } catch (error) {
    console.error('Error loading my banks page:', error);
    return (
      <section className='flex'>
        <div className="my-banks">
          <HeaderBox 
            title="My Bank Accounts"
            subtext="Unable to load bank accounts. Please try again later."
          />
          <div className="space-y-4">
            <h2 className="header-2">
              Your cards
            </h2>
            <div className="flex flex-wrap gap-6">
              <p className="text-red-500">Error loading bank accounts. Please refresh the page.</p>
            </div>
          </div>
        </div>
      </section>
    );
  }
}

export default MyBanks