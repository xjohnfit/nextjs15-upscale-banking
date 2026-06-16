const Loading = () => {
    return (
        <div className='flex h-screen w-full items-center justify-center'>
            <div className='flex flex-col items-center gap-4'>
                <div className='h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-bankGradient' />
                <p className='text-14 text-gray-500'>Loading...</p>
            </div>
        </div>
    );
};

export default Loading;
