import { Spinner } from '@heroui/react';
import { HTMLAttributes } from 'react';
import { twMerge } from 'tailwind-merge';

/**
 *  Loading component
 */
export default function Loading(props: HTMLAttributes<HTMLDivElement>) {
  return (
    <div {...props} className={twMerge('flex w-full h-full justify-center items-center text-2xl', props.className)}>
      <Spinner color="default" label="Loading ..." />
    </div>
  );
}
