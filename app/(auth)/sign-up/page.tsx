import AuthForm from '@/components/AuthForm';
import ProductionDebug from '@/components/ProductionDebug';

const SignUp = async () => {
    return (
        <section className='flex-center size-full max-sm:px-6'>
            <AuthForm type='sign-up' />
            {/* Production debug - always available but small */}
            <div className='fixed bottom-4 left-4 z-50'>
                <ProductionDebug />
            </div>
        </section>
    );
};

export default SignUp;
