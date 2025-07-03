import Image from 'next/image';

import { topCategoryStyles } from '@/constants';
import { cn } from '@/lib/utils';

import { Progress } from './ui/progress';

const Category = ({ category }: CategoryProps) => {
    const {
        bg,
        circleBg,
        text: { main, count },
        progress: { bg: progressBg, indicator },
        icon,
    } = topCategoryStyles[category.name as keyof typeof topCategoryStyles] ||
    topCategoryStyles.default;

    return (
        <div
            className={cn(
                'flex items-center gap-4 rounded-xl border border-gray-200 p-4 transition-all duration-200 hover:shadow-md hover:border-gray-300',
                bg
            )}>
            <figure
                className={cn(
                    'flex-center min-w-10 w-10 h-10 rounded-full',
                    circleBg
                )}>
                <Image
                    src={icon}
                    width={20}
                    height={20}
                    alt={category.name}
                />
            </figure>
            <div className='flex w-full flex-1 flex-col gap-2'>
                <div className='flex items-center justify-between'>
                    <h2 className={cn('text-14 font-medium', main)}>
                        {category.name}
                    </h2>
                    <h3 className={cn('text-14 font-semibold', count)}>
                        {category.count}
                    </h3>
                </div>
                <Progress
                    value={(category.count / category.totalCount) * 100}
                    className={cn('h-2 w-full', progressBg)}
                    indicatorClassName={cn(
                        'h-full w-full flex-1 transition-all duration-300',
                        indicator
                    )}
                />
            </div>
        </div>
    );
};

export default Category;
