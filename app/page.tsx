'use client';

import { Card, Image, Input } from '@heroui/react';
import { IconSearch } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useCallback, useState } from 'react';

/**
 *  Home page
 */
export default function Home() {
  const router = useRouter();

  const [name, setName] = useState('');

  const find = useCallback(() => {
    if (!name) return alert('Please enter a repository name');
    else if (!name.match(/^.+\/.+$/)) return alert('Invalid repository name');
    else router.push(`/r/${name}`);
  }, [name, router]);

  return (
    <div className="h-full w-full flex flex-col items-center gap-8 mt-10">
      <div className="text-[3rem] max-sm:text-[2.25rem] text-center font-black text-gray-600 w-[55rem] max-sm:w-[95vw] leading-tight">
        Discover the developers powering your favorite GitHub project
      </div>
      <div className="text-[1.5rem] max-sm:text-[1.15rem] text-gray-400 text-center w-[40rem] max-sm:w-[85vw]">
        Insights on Stars, Watchers, Tags, Releases, and the Developers Behind Them
      </div>
      <div className="mb-12 max-sm:mb-6">
        <Input
          placeholder="Enter the name (e.g., octokit/octokit.js)"
          endContent={<IconSearch className="text-gray-600 cursor-pointer w-6 h-auto" onClick={find} />}
          type="search"
          className="w-[35rem] max-sm:w-[22rem] my-2"
          value={name}
          onValueChange={(value) => setName(value)}
          classNames={{
            base: 'text-gray-600',
            input: 'text-center text-gray-300 text-[1.25rem] max-sm:text-[1rem]',
            inputWrapper: 'border-2 border-gray-300 rounded-full p-6 max-sm:p-2'
          }}
          onKeyDown={(event) => event.key === 'Enter' && find()}
        />
      </div>
      <div>
        <Card isHoverable classNames={{ base: 'shadow-inner shadow-xl shadow-gray-400' }}>
          <Image src="/images/octokit_octokit_js.jpg" alt="" className="max-w-[45rem] w-[90vw] h-auto" />
        </Card>
      </div>
    </div>
  );
}
