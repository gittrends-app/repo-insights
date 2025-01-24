import { Actor } from '@gittrends-app/core';

export type ActorInfo = Actor & {
  events: Array<{ type: 'starred' | 'release' | 'reaction' | 'watching'; date: Date }>;
};
