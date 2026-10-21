import * as migration_20261021_200851_initial from './20261021_200851_initial';
import * as migration_20261021_205731_payload_3_91_upgrade from './20261021_205731_payload_3_91_upgrade';
import * as migration_20261021_213023_services_spec_sheet from './20261021_213023_services_spec_sheet';
import * as migration_20261021_213355_page_block_headings from './20261021_213355_page_block_headings';

export const migrations = [
  {
    up: migration_20261021_200851_initial.up,
    down: migration_20261021_200851_initial.down,
    name: '20261021_200851_initial',
  },
  {
    up: migration_20261021_205731_payload_3_91_upgrade.up,
    down: migration_20261021_205731_payload_3_91_upgrade.down,
    name: '20261021_205731_payload_3_91_upgrade',
  },
  {
    up: migration_20261021_213023_services_spec_sheet.up,
    down: migration_20261021_213023_services_spec_sheet.down,
    name: '20261021_213023_services_spec_sheet',
  },
  {
    up: migration_20261021_213355_page_block_headings.up,
    down: migration_20261021_213355_page_block_headings.down,
    name: '20261021_213355_page_block_headings'
  },
];
