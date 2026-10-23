import * as migration_20261021_200851_initial from './20261021_200851_initial';
import * as migration_20261021_205731_payload_3_91_upgrade from './20261021_205731_payload_3_91_upgrade';
import * as migration_20261021_213023_services_spec_sheet from './20261021_213023_services_spec_sheet';
import * as migration_20261021_213355_page_block_headings from './20261021_213355_page_block_headings';
import * as migration_20261021_235806_remove_confirmation_flags from './20261021_235806_remove_confirmation_flags';
import * as migration_20261022_002420_add_commercial_registration from './20261022_002420_add_commercial_registration';
import * as migration_20261023_120000_localize_team_member_name from './20261023_120000_localize_team_member_name';

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
    name: '20261021_213355_page_block_headings',
  },
  {
    up: migration_20261021_235806_remove_confirmation_flags.up,
    down: migration_20261021_235806_remove_confirmation_flags.down,
    name: '20261021_235806_remove_confirmation_flags',
  },
  {
    up: migration_20261022_002420_add_commercial_registration.up,
    down: migration_20261022_002420_add_commercial_registration.down,
    name: '20261022_002420_add_commercial_registration',
  },
  {
    up: migration_20261023_120000_localize_team_member_name.up,
    down: migration_20261023_120000_localize_team_member_name.down,
    name: '20261023_120000_localize_team_member_name'
  },
];
