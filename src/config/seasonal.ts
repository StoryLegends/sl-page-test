export type Season = 'winter' | 'spring' | 'summer' | 'autumn' | 'new-year' | 'halloween' | 'valentines' | 'womens-day' | 'victory-day' | 'none';

export const CURRENT_SEASON: Season = (import.meta.env.VITE_SEASON as Season) || 'none';

export const seasonalEffects = {
  winter: {
    enabled: true,
    particles: ['❄️'],
    count: 40,
    animation: 'snow-fall',
  },
  spring: {
    enabled: true,
    particles: ['🌸', '🥚', '🐇', '🌱'],
    count: 30,
    animation: 'float-up',
  },
  summer: {
    enabled: true,
    particles: ['☀️', '🏖️', '⛱️', '🌊'],
    count: 20,
    animation: 'sun-rays',
  },
  autumn: {
    enabled: true,
    particles: ['🍂', '🍁', '🍄'],
    count: 40,
    animation: 'leaves-fall',
  },
  'new-year': {
    enabled: true,
    particles: ['🎄', '🎅', '🎁', '❄️'],
    count: 40,
    animation: 'snow-fall',
  },
  halloween: {
    enabled: true,
    particles: ['🎃', '👻', '🕸️', '🦇'],
    count: 30,
    animation: 'float-up',
  },
  valentines: {
    enabled: true,
    particles: ['❤️', '💖', '🌹', '💌'],
    count: 30,
    animation: 'float-up',
  },
  'womens-day': {
    enabled: true,
    particles: ['🌷', '💐', '🌸', '🎀'],
    count: 30,
    animation: 'float-up',
  },
  'victory-day': {
    enabled: true,
    particles: ['⭐', '🎗️', '🎆'],
    count: 30,
    animation: 'float-up',
  },
  none: {
    enabled: false,
    particles: [],
    count: 0,
    animation: '',
  },
};
