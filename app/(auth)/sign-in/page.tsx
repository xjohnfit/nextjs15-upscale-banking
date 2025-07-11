import AuthForm from '@/components/AuthForm';
import CookieTest from '@/components/CookieTest';
import ProductionDebug from '@/components/ProductionDebug';

const SignIn = () => {
    return (
        <section className='flex-center size-full max-sm:px-6'>
            <AuthForm type='sign-in' />
            {process.env.NODE_ENV === 'development' && (
                <div className='fixed top-4 right-4'>
                    <CookieTest />
                </div>
            )}
            {/* Production debug - always available but small */}
            <div className='fixed bottom-4 left-4 z-50'>
                <ProductionDebug />
            </div>
        </section>
    );
};

export default SignIn;
