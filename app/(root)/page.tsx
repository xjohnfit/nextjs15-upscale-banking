import HeaderBox from '@/components/HeaderBox'
import RecentTransactions from '@/components/RecentTransactions';
import RightSidebar from '@/components/RightSidebar';
import TotalBalanceBox from '@/components/TotalBalanceBox';
import { getAccount, getAccounts } from '@/lib/actions/bank.actions';
import { getLoggedInUser } from '@/lib/actions/user.actions';

const Home = async (props: SearchParamProps) => {
  const searchParams = props.searchParams;

  const {
    id,
    page
  } = searchParams;

  const currentPage = Number(page as string) || 1;
  
  try {
    const loggedIn = await getLoggedInUser();
    
    if (!loggedIn) {
      return (
        <section className="home">
          <div className="home-content">
            <header className="home-header">
              <HeaderBox 
                type="greeting"
                title="Welcome"
                user="Guest"
                subtext="Please sign in to access your banking dashboard."
              />
            </header>
          </div>
        </section>
      );
    }

    const accounts = await getAccounts({ 
      userId: loggedIn.$id,
    })

    if(!accounts) {
      return (
        <section className="home">
          <div className="home-content">
            <header className="home-header">
              <HeaderBox 
                type="greeting"
                title="Welcome"
                user={loggedIn?.firstName || 'Guest'}
                subtext="No bank accounts found. Please connect a bank account to get started."
              />
            </header>
          </div>
        </section>
      );
    }

    const accountsData = accounts?.data;
    const appwriteItemId = (id as string) || accountsData[0]?.appwriteItemId;

    const account = await getAccount({ appwriteItemId })

    return (
      <section className="home">
        <div className="home-content">
          <header className="home-header">
            <HeaderBox 
              type="greeting"
              title="Welcome"
              user={loggedIn?.firstName || 'Guest'}
              subtext="Access and manage your account and transactions efficiently."
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
    )
  } catch (error) {
    console.error('Error loading home page:', error);
    return (
      <section className="home">
        <div className="home-content">
          <header className="home-header">
            <HeaderBox 
              type="greeting"
              title="Welcome"
              user="Guest"
              subtext="Unable to load banking data. Please try again later."
            />
          </header>
        </div>
      </section>
    );
  }
}

export default Home