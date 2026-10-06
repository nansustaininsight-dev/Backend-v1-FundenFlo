import { existsSync } from 'node:fs';

import EmbeddedPostgres from 'embedded-postgres';

const databaseDir = '.pgdata';
const postgres = new EmbeddedPostgres({
  databaseDir,
  user: 'fundenflo',
  password: 'fundenflo',
  port: 5432,
  persistent: true,
});

const fresh = !existsSync(`${databaseDir}/PG_VERSION`);

if (fresh) {
  await postgres.initialise();
}

await postgres.start();

if (fresh) {
  await postgres.createDatabase('fundenflo');
}

console.log('PostgreSQL ready on localhost:5432 database fundenflo');

setInterval(() => {}, 60_000);
