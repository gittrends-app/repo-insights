import { Actor, User } from '@/core';
import { ActorInfo } from '@/entities/ActorInfo';
import { SocialPlatforms } from '@/helpers/social';
import {
  Checkbox,
  Divider,
  Pagination,
  Select,
  SelectItem,
  SortDescriptor,
  Spinner,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  User as UserAvatar
} from '@heroui/react';
import { IconDownload, IconMail } from '@tabler/icons-react';
import { countBy, orderBy } from 'lodash';
import Link from 'next/link';
import numeral from 'numeral';
import { useMemo, useState } from 'react';
import { useBoolean } from 'react-use';

import dayjs from 'dayjs';
import localizedFormat from 'dayjs/plugin/localizedFormat';
import relativeFormat from 'dayjs/plugin/relativeTime';
dayjs.extend(localizedFormat);
dayjs.extend(relativeFormat);

/**
 *
 */
export default function RepositoryTable({ actors }: { actors: ActorInfo[] }) {
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState<number>(10);
  const [descriptor, setDescriptor] = useState<SortDescriptor[]>([]);
  const [showDetails, setShowDetails] = useBoolean(false);

  const items = useMemo(() => {
    const orderedItems = descriptor
      ? orderBy(
          actors || [],
          descriptor.map((desc) =>
            desc.column === 'events' ? (e) => e.events.length : (e) => e[desc.column as keyof Actor] ?? ''
          ),
          descriptor.map((desc) => (desc.direction === 'ascending' ? 'asc' : 'desc'))
        )
      : actors;
    const start = (page - 1) * perPage;
    return orderedItems.slice(start, start + perPage) || [];
  }, [actors, descriptor, page, perPage]);

  return (
    <Table
      isCompact
      isStriped
      removeWrapper
      sortDescriptor={descriptor.at(0)}
      onSortChange={({ column, direction }) =>
        setDescriptor([
          { column, direction: column !== descriptor.at(0)?.column ? 'descending' : direction },
          ...descriptor.filter((d) => d.column !== column)
        ])
      }
      bottomContent={
        <div className="flex max-sm:flex-col-reverse max-sm:gap-4 w-full justify-between max-sm:justify-center px-4 items-center">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <div>
              <strong>Total:</strong> {numeral(actors.length).format('0,0')}
            </div>
            <Divider orientation="vertical" className="h-4" />
            <Checkbox
              size="sm"
              classNames={{ label: 'text-sm text-gray-500 ml-[-5px]' }}
              disabled
              defaultChecked={showDetails}
              onValueChange={(selected) => setShowDetails(selected)}
            >
              Show details
            </Checkbox>
            <Divider orientation="vertical" className="h-4" />
            <Link
              className="flex gap-1 text-sm text-gray-500"
              href={`data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(actors))}`}
              target="_blank"
              download={`users-data-${Date.now()}.json`}
            >
              <IconDownload className="w-4 h-auto" /> Download
            </Link>
          </div>
          <Pagination
            isCompact
            showControls
            showShadow
            size="sm"
            page={1}
            total={Math.ceil(actors.length / perPage)}
            onChange={(page) => setPage(page)}
          />
          <div className="flex w-36 max-sm:hidden">
            <Select
              label="Per page"
              variant="underlined"
              size="sm"
              defaultSelectedKeys={new Set([`${perPage}`])}
              onSelectionChange={(values) => setPerPage(Number(values.currentKey || '10'))}
            >
              <SelectItem key={10}>10</SelectItem>
              <SelectItem key={25}>25</SelectItem>
              <SelectItem key={50}>50</SelectItem>
              <SelectItem key={100}>100</SelectItem>
            </Select>
          </div>
        </div>
      }
      className="overflow-x-auto overflow-y-hidden pb-4"
    >
      <TableHeader>
        <TableColumn align="center" key="login" allowsSorting>
          USER
        </TableColumn>
        <TableColumn align="center" key="events" allowsSorting>
          ACTIONS
        </TableColumn>
        <TableColumn align="center" key="followers_count" allowsSorting>
          FOLLOWERS
        </TableColumn>
        <TableColumn align="center" key="following_count" allowsSorting>
          FOLLOWING
        </TableColumn>
        <TableColumn align="center" key="created_at" allowsSorting>
          ACCOUNT AGE
        </TableColumn>
        <TableColumn align="center" key="company" allowsSorting>
          COMPANY
        </TableColumn>
        <TableColumn align="center" key="location" allowsSorting>
          LOCATION
        </TableColumn>
        <TableColumn align="center" key="social">
          SOCIAL
        </TableColumn>
        <TableColumn align="center" key="is_hireable" allowsSorting hidden={!showDetails}>
          HIREABLE
        </TableColumn>
        <TableColumn align="center" key="is_github_star" allowsSorting hidden={!showDetails}>
          STAR
        </TableColumn>
        <TableColumn align="center" key="is_campus_expert" allowsSorting hidden={!showDetails}>
          EXPERT
        </TableColumn>
      </TableHeader>
      <TableBody emptyContent="No stargazers found" loadingContent={<Spinner label="Loading..." />}>
        {items.map((item, index) => {
          const user = item as User;
          return (
            <TableRow key={index}>
              <TableCell>
                <div className="flex gap-3 items-center">
                  <UserAvatar
                    avatarProps={{ size: 'sm', src: user.avatar_url, className: 'max-sm:w-7 max-sm:h-7' }}
                    description={user.name?.slice(0, 20)}
                    name={<Link target="_blank" href={`https://github.com/${user.login}`}>{`@${user.login}`}</Link>}
                  />
                </div>
              </TableCell>
              <TableCell>
                {Object.entries(countBy(item.events, 'type'))
                  .map(([event, count]) => `${event}: ${count}`)
                  .map((s, index) => (
                    <div key={index} className="text-xs">
                      {s}
                    </div>
                  ))}
              </TableCell>
              <TableCell>{numeral(user.followers_count).format('0,0')}</TableCell>
              <TableCell>{numeral(user.following_count).format('0,0')}</TableCell>
              <TableCell>
                <abbr title={`Created at ${dayjs(user.created_at).format('LLL')}`}>
                  {dayjs(user.created_at).fromNow(true)}
                </abbr>
              </TableCell>
              <TableCell>{user.company}</TableCell>
              <TableCell>{user.location}</TableCell>
              <TableCell>
                <div className="flex gap-2 justify-center">
                  {user.social_accounts &&
                    Object.entries(user.social_accounts).map(([name, value]) => {
                      if (!SocialPlatforms[name]) return null;
                      const { Icon, url } = SocialPlatforms[name];

                      return (
                        <span key={name} className="flex justify-center items-center text-xm">
                          <Link href={`${url ? url + '/' : ''}${value}`} target="_blank">
                            <Icon size="1.25em" />
                          </Link>
                        </span>
                      );
                    })}
                  {user.email && (
                    <span className="flex justify-center items-center text-xm">
                      <Link href={`mailto:${user.email}`} target="_blank">
                        <IconMail size="1.25em" />
                      </Link>
                    </span>
                  )}
                </div>
              </TableCell>
              <TableCell hidden={!showDetails}>
                <Checkbox isSelected={user.is_hireable} isDisabled size="sm" color="default" />
              </TableCell>
              <TableCell hidden={!showDetails}>
                <Checkbox isSelected={user.is_github_star} isDisabled size="sm" color="default" />
              </TableCell>
              <TableCell hidden={!showDetails}>
                <Checkbox isSelected={user.is_campus_expert} isDisabled size="sm" color="default" />
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
