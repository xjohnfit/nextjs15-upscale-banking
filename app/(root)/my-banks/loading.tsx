const Loading = () => {
    return (
        <section className='flex'>
            <div className='my-banks'>
                <div className='flex flex-col gap-2'>
                    <div className='h-8 w-48 animate-pulse rounded bg-gray-200' />
                    <div className='h-4 w-72 animate-pulse rounded bg-gray-200' />
                </div>
                <div className='space-y-4'>
                    <div className='h-6 w-24 animate-pulse rounded bg-gray-200' />
                    <div className='flex flex-wrap gap-6'>
                        {[1, 2, 3].map((i) => (
                            <div
                                key={i}
                                className='h-[190px] w-full max-w-[320px] animate-pulse rounded-[20px] bg-gray-200'
                            />
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Loading;
