import * as migration_20260726_174057_initial from './20260726_174057_initial';
import * as migration_20260726_201849_boutique from './20260726_201849_boutique';

export const migrations = [
  {
    up: migration_20260726_174057_initial.up,
    down: migration_20260726_174057_initial.down,
    name: '20260726_174057_initial',
  },
  {
    up: migration_20260726_201849_boutique.up,
    down: migration_20260726_201849_boutique.down,
    name: '20260726_201849_boutique'
  },
];
