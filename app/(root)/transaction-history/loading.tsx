const Loading = () => {
    return (
        <div className='transactions'>
            <div className='transactions-header'>
                <div className='flex flex-col gap-2'>
                    <div className='h-8 w-56 animate-pulse rounded bg-gray-200' />
                    <div className='h-4 w-72 animate-pulse rounded bg-gray-200' />
                </div>
            </div>
            <div className='space-y-6'>
                <div className='transactions-account'>
                    <div className='flex flex-col gap-2'>
                        <div className='h-5 w-36 animate-pulse rounded bg-blue-400' />
                        <div className='h-4 w-48 animate-pulse rounded bg-blue-400' />
                        <div className='h-4 w-32 animate-pulse rounded bg-blue-400' />
                    </div>
                </div>
                <div className='flex flex-col gap-3'>
                    {Array.from({ length: 8 }).map((_, i) => (
                        <div
                            key={i}
                            className='h-12 w-full animate-pulse rounded bg-gray-200'
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Loading;
