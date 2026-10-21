import * as migration_20261021_200851_initial from './20261021_200851_initial';
import * as migration_20261021_205731_payload_3_91_upgrade from './20261021_205731_payload_3_91_upgrade';

export const migrations = [
  {
    up: migration_20261021_200851_initial.up,
    down: migration_20261021_200851_initial.down,
    name: '20261021_200851_initial',
  },
  {
    up: migration_20261021_205731_payload_3_91_upgrade.up,
    down: migration_20261021_205731_payload_3_91_upgrade.down,
    name: '20261021_205731_payload_3_91_upgrade'
  },
];
