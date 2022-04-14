require("dotenv").config();
/*

  PORT=9000
  NODE_ENV=development
  DEV_DATABASE_URL=postgresql://postgres:password@localhost:5432/database_name
  TESTING_DATABASE_URL=postgresql://postgres:password@localhost:5432/testing_database_name

  Put the above in your .env file. Some adjustments in the connection URLs will be needed:

    - 5432 (this is the default TCP port for PostgreSQL, should work as is)
    - postgres (in postgres:password, this is the default superadmin user, might work as is)
    - password (in postgres:password, replace with the actual password of the postgres user)
    - database_name (use the real name of the development database you created in pgAdmin 4)
    - testing_database_name (use the real name of the testing database you created in pgAdmin 4)

*/
const pg = require("pg");

if (process.env.DATABASE_URL) {
    pg.defaults.ssl = { rejectUnauthorized: false };
}

const sharedConfig = {
    client: "pg",
    migrations: { directory: "./api/data/migrations" },
    seeds: { directory: "./api/data/seeds" },
};

function onResponseUpdateFunction() {
    return `CREATE FUNCTION RESPONSES_NOTIFY_TRIGGER() RETURNS TRIGGER AS $$
      DECLARE
      BEGIN
        PERFORM pg_notify('update_notification', row_to_json(new) :: text);
        RETURN new;
      END;
      $$ LANGUAGE PLPGSQL;`;
}

function onResponseUpdateTrigger() {
    return `CREATE TRIGGER RESPONSES_UPDATE_TRIGGER AFTER
      UPDATE ON RESPONSES
      FOR EACH ROW EXECUTE PROCEDURE RESPONSES_NOTIFY_TRIGGER();`;
}

function onResponsePairsInsertFunction() {
    return `CREATE FUNCTION RESPONSE_PAIRS_NOTIFY_TRIGGER() RETURNS TRIGGER AS $$
      DECLARE
      BEGIN
        PERFORM pg_notify('update_notification', row_to_json(new) :: text);
        RETURN new;
      END;
      $$ LANGUAGE PLPGSQL;`;
}
function onResponsePairsInsertTrigger() {
    return `CREATE TRIGGER RESPONSE_PAIRS_UPDATE_TRIGGER AFTER
      INSERT ON RESPONSE_PAIRS
      FOR EACH ROW EXECUTE PROCEDURE RESPONSE_PAIRS_NOTIFY_TRIGGER();`;
}

function dropOnResponseUpdateTrigger() {
    return `DROP TRIGGER IF EXISTS RESPONSES_UPDATE_TRIGGER ON RESPONSES;`;
}

function dropOnResponsePairsInsertTrigger() {
    return `DROP TRIGGER IF EXISTS RESPONSE_PAIRS_UPDATE_TRIGGER ON RESPONSE_PAIRS;`;
}

module.exports = {
    development: {
        ...sharedConfig,
        connection: process.env.DEV_DATABASE_URL,
    },
    testing: {
        ...sharedConfig,
        connection: process.env.TESTING_DATABASE_URL,
    },
    production: {
        ...sharedConfig,
        connection: process.env.DATABASE_URL,
        pool: { min: 2, max: 10 },
    },
    onResponseUpdateFunction,
    onResponseUpdateTrigger,
    onResponsePairsInsertTrigger,
    onResponsePairsInsertFunction,
    dropOnResponseUpdateTrigger,
    dropOnResponsePairsInsertTrigger,
};
