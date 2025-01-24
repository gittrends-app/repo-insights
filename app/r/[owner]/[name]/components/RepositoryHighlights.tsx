import { ActorInfo } from '@/entities/ActorInfo';
import { User } from '@gittrends-app/core';
import { Avatar, AvatarGroup, Link, Tooltip } from '@heroui/react';
import { orderBy } from 'lodash';
import numeral from 'numeral';
import { useMemo } from 'react';

import dayjs from 'dayjs';
import localizedFormat from 'dayjs/plugin/localizedFormat';
dayjs.extend(localizedFormat);

/**
 *  Highlights component
 */
function Highlights(data: {
  title: string;
  actors: ActorInfo[];
  description: (info: ActorInfo) => undefined | string;
}) {
  return (
    <div className="flex flex-col gap-1 items-center max-sm:text-sm">
      <span className="text-center text-gray font-bold">{data.title}</span>
      <div>
        <AvatarGroup
          isBordered
          max={5}
          renderCount={(count) => (
            <p className="text-small text-foreground font-medium ms-2">+{numeral(count).format('0,0')}</p>
          )}
        >
          {data.actors.map((actor) => {
            return (
              <Tooltip
                key={actor.id}
                closeDelay={100}
                content={
                  <div className="flex flex-col w-44">
                    <span className="text-center font-bold">{actor.login}</span>
                    <span className="text-center text-xs">{data.description(actor)}</span>
                  </div>
                }
              >
                <Link isExternal href={`https://github.com/${actor.login}`}>
                  <Avatar src={actor.avatar_url} className="w-8 h-8 max-sm:w-7 max-sm:h-7" />
                </Link>
              </Tooltip>
            );
          })}
        </AvatarGroup>
      </div>
    </div>
  );
}

/**
 *  RepositoryHighlights component
 */
export default function RepositoryHighlights({ actors }: { actors: ActorInfo[] }) {
  const sorted = useMemo(
    () =>
      orderBy(actors, 'created_at', 'asc').sort(
        (a, b) => ((b as User).email?.length ? 1 : 0) - ((a as User).email?.length ? 1 : 0)
      ),
    [actors]
  );

  return (
    <div className="border-y-1 mx-4 pt-2 pb-4 flex items-center justify-evenly max-sm:flex-wrap max-sm:gap-4">
      <Highlights
        title="Oldest stargazers"
        actors={actors
          .filter((a) => a.events.find((e) => e.type === 'starred'))
          .sort(
            (a, b) =>
              a.events.find((e) => e.type === 'starred')!.date.getTime() -
              b.events.find((e) => e.type === 'starred')!.date.getTime()
          )
          .slice(0, 5)}
        description={(actor) => `Since ${dayjs(actor.events.find((e) => e.type === 'starred')!.date).format('lll')}`}
      />
      <Highlights
        title="Most followers"
        actors={orderBy(actors, 'followers_count', 'desc').slice(0, 5)}
        description={(actor) => `${numeral((actor as User).followers_count).format('0,0')} followers`}
      />
      {sorted.some((s) => (s as User).is_github_star) && (
        <Highlights
          title="Github Star"
          actors={sorted.filter((s) => (s as User).is_github_star)}
          description={(actor) => (actor as User).name}
        />
      )}
      {sorted.some((s) => (s as User).is_campus_expert) && (
        <Highlights
          title="Campus Experts"
          actors={sorted.filter((s) => (s as User).is_campus_expert)}
          description={(actor) => (actor as User).name}
        />
      )}
      {sorted.some((s) => (s as User).is_hireable) && (
        <Highlights
          title="Hireable users"
          actors={sorted.filter((s) => (s as User).is_hireable)}
          description={(actor) => `Email: ${(actor as User).email}`}
        />
      )}
    </div>
  );
}
