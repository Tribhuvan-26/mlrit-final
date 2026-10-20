import * as migration_20261006_083430_initial from './20261006_083430_initial';
import * as migration_20261006_084423_gallery_columns from './20261006_084423_gallery_columns';
import * as migration_20261019_061412_s3_storage from './20261019_061412_s3_storage';

export const migrations = [
  {
    up: migration_20261006_083430_initial.up,
    down: migration_20261006_083430_initial.down,
    name: '20261006_083430_initial',
  },
  {
    up: migration_20261006_084423_gallery_columns.up,
    down: migration_20261006_084423_gallery_columns.down,
    name: '20261006_084423_gallery_columns',
  },
  {
    up: migration_20261019_061412_s3_storage.up,
    down: migration_20261019_061412_s3_storage.down,
    name: '20261019_061412_s3_storage'
  },
];
