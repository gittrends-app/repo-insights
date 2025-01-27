'use client';

import {
  Button,
  Link,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  useDisclosure,
  UseDisclosureProps
} from '@heroui/react';
import { IconTrash } from '@tabler/icons-react';
import numeral from 'numeral';
import { useCallback, useReducer } from 'react';
import { useAsync } from 'react-use';
import { twMerge } from 'tailwind-merge';

export default function CacheManager(props: UseDisclosureProps) {
  const { isOpen, onOpenChange, onClose } = useDisclosure(props);

  const [version, forceUpdate] = useReducer((x) => x + 1, 1);

  const databases = useAsync(async () => {
    const dbs = await indexedDB.databases();
    const data = await Promise.all(
      dbs.map(async (db) => ({ name: db.name!, size: (await navigator.storage.estimate()).usage!, deleted: false }))
    );
    return data.filter((db) => db.name.match(/(.*)\/(.*)$/g));
  }, []);

  const confirmDeletion = useCallback(
    (name: string) => {
      const response = confirm(`Are you sure you want to delete the cache for ${name}?`);
      if (response) {
        indexedDB.deleteDatabase(name);
        forceUpdate();
        databases.value!.find((db) => db.name === name)!.deleted = true;
      }
    },
    [databases.value]
  );

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      size="2xl"
      placement="top-center"
      scrollBehavior="inside"
      backdrop="blur"
    >
      <ModalContent>
        <ModalHeader>Cache information</ModalHeader>
        <ModalBody>
          <p className="italic text-justify text-gray-600">
            This application uses IndexedDB to store data locally, ensuring faster data collection and retrieval. By
            leveraging IndexedDB, the app can work efficiently even with limited internet connectivity.
          </p>
          {databases.value?.length ? (
            <p>At the moment, we have cached data from the following repositories:</p>
          ) : (
            <p>At the moment, you do not have any data cached in your browser :)</p>
          )}

          <ul className="list-disc list-inside">
            {version &&
              databases.value?.map((db, index) => (
                <li key={index}>
                  <div className={twMerge('inline-flex items-center gap-1', db.deleted && 'line-through')}>
                    <span>
                      {db.name} ({numeral(db.size).format('0.0b')})
                    </span>
                    <Link
                      onPress={() => confirmDeletion(db.name)}
                      className="hover:cursor-pointer -mt-1"
                      isDisabled={db.deleted}
                    >
                      <IconTrash size={20} className="inline text-red-500" />
                    </Link>
                  </div>
                </li>
              ))}
          </ul>
        </ModalBody>
        <ModalFooter>
          <Button onPress={onClose}>Close</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
