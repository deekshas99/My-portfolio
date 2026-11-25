import type { Person } from './lib/types';

/** Your message, world name and palette live here. */
export const worldConfig = {
  title: 'Stillworld',
  /** While this is false the garden carries the seeded flowers only, and the
      invitation to leave a message stays hidden. Submission and moderation
      keep working underneath; turn it on when you want visitors. */
  invitesOpen: false,
  owner: {
    id: 'owner', name: 'Me', activity: 'walk' as const, finish: 'silver' as const,
    message: 'Somewhere between where I have been and where I am going. For now, I’m here. Leave a little of yourself, too.',
  },
  /** The flowers already standing in the bed. Placeholders: rewrite the names
      and words, add or remove entries, and the garden re-plants itself. */
  seeded: [
    { id: 'seed-dusk', name: 'Ana', activity: 'walk', finish: 'blue', message: 'Came here for the quiet and stayed a good while longer than I meant to.' },
    { id: 'seed-slow', name: 'Ravi', activity: 'pause', finish: 'silver', message: 'Not every thought needs an answer. Some of them just need somewhere to sit.' },
    { id: 'seed-return', name: 'Mira', activity: 'walk', finish: 'ink', message: 'I keep a list of places I mean to come back to. This one is on it now.' },
    { id: 'seed-late', name: 'Jonah', activity: 'pause', finish: 'blue', message: 'Found this at the end of a long week and read everything here twice.' },
  ] as Person[],
  maxMessageLength: 180,
  maxNameLength: 28,
  peoplePerView: 8,
  mobilePeoplePerView: 4,
  typeIntervalMs: 32,
  palette: { fog: '#0a1a22', floor: '#12301f', background: '#c4a479' },
};

/** The white wire flower — hover text only, not counted among the planted messages. */
export const inviteWirePerson: Person = {
  id: 'invite-wire',
  name: '',
  activity: 'walk',
  finish: 'silver',
  message: 'leave a sweet message',
};
