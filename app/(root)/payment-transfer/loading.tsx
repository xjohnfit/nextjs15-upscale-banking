const Loading = () => {
    return (
        <section className='payment-transfer'>
            <div className='flex flex-col gap-2'>
                <div className='h-8 w-48 animate-pulse rounded bg-gray-200' />
                <div className='h-4 w-80 animate-pulse rounded bg-gray-200' />
            </div>
            <div className='mt-6 flex flex-col gap-6'>
                {Array.from({ length: 5 }).map((_, i) => (
                    <div
                        key={i}
                        className='h-16 w-full max-w-[850px] animate-pulse rounded bg-gray-200'
                    />
                ))}
            </div>
        </section>
    );
};

export default Loading;
