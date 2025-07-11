import AuthForm from '@/components/AuthForm';
import ProductionDebug from '@/components/ProductionDebug';

const SignUp = async () => {
    return (
        <section className='flex-center size-full max-sm:px-6'>
            <AuthForm type='sign-up' />
            {/* Production debug - moved to far right to avoid form overlap */}
            <div className='fixed top-4 right-4 z-50 max-w-xs'>
                <ProductionDebug />
            </div>
        </section>
    );
};

export default SignUp;
