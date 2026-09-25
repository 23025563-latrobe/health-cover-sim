
const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');

const defaultDataDirectory = path.join(__dirname, '../../data');

const databaseFile =
    process.env.NODE_ENV === 'test'
        ? 'healthcoversim-test.db'
        : 'healthcoversim.db';

const databasePath =
    process.env.NODE_ENV === 'test'
        ? path.join(defaultDataDirectory, databaseFile)
        : path.resolve(
            process.env.DATABASE_PATH ||
            path.join(defaultDataDirectory, databaseFile)
        );

const schemaPath = path.join(__dirname, '../../db/init.sql');

fs.mkdirSync(path.dirname(databasePath), {
    recursive: true
});

const database = new Database(databasePath);

database.pragma('foreign_keys = ON');

const schema = fs.readFileSync(schemaPath, 'utf8');

database.exec(schema);

module.exports = database;
