import React from 'react';

const PlaygroundInfo = () => {
    return (
        <section className='w-full max-w-sm mx-auto bg-white rounded-2xl p-6 flex flex-col items-center'>
            <h2 className='text-base font-semibold text-gray-900 mb-1 tracking-tight'>
                Playground Info
            </h2>
            <p className='text-xs text-gray-500 mb-4 text-center'>
                Don't want to sign-up?. <br />
                Try our demo account below to explore features.
            </p>
            <div className='w-full bg-gray-50 rounded-xl p-4 flex flex-col gap-2'>
                <div className='flex items-center justify-between'>
                    <span className='font-medium text-gray-400 text-xs'>
                        Email
                    </span>
                    <span className='text-gray-800 text-xs font-mono select-all px-2 py-1 bg-white rounded'>
                        {'xjohnfitcodes@gmail.com'}
                    </span>
                </div>
                <div className='flex items-center justify-between'>
                    <span className='font-medium text-gray-400 text-xs'>
                        Password
                    </span>
                    <span className='text-gray-800 text-xs font-mono select-all px-2 py-1 bg-white rounded'>
                        {'demoPassword123'}
                    </span>
                </div>
            </div>
            <p className='text-[10px] text-gray-400 mt-5 text-center italic'>
                Sandbox only. No real transactions will occur.
            </p>
            <div className='w-full bg-blue-50 rounded-xl p-4 mt-4'>
                <h3 className='font-medium text-blue-900 text-xs mb-2'>
                    💡 Bank Connection Tip
                </h3>
                <p className='text-[10px] text-blue-700 leading-relaxed'>
                    For seamless connection without popups, select these banks
                    in Plaid:
                    <br />• <strong>First Platypus Bank</strong>
                    <br />• <strong>Tattersall Federal Credit Union</strong>
                    <br />• <strong>Houndstooth Bank</strong>
                    <br />
                    <span className='text-blue-600 italic'>
                        These banks complete authentication within the modal.
                    </span>
                </p>
            </div>
        </section>
    );
};

export default PlaygroundInfo;
