import * as migration_20260726_174057_initial from './20260726_174057_initial';

export const migrations = [
  {
    up: migration_20260726_174057_initial.up,
    down: migration_20260726_174057_initial.down,
    name: '20260726_174057_initial'
  },
];
