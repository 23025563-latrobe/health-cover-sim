const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');

const dataDirectory = path.join(__dirname, '../../data');

const databaseFile =
    process.env.NODE_ENV === 'test'
        ? 'healthcoversim-test.db'
        : 'healthcoversim.db';

const databasePath = path.join(dataDirectory, databaseFile);
const schemaPath = path.join(__dirname, '../../db/init.sql');

fs.mkdirSync(dataDirectory, { recursive: true });

const database = new Database(databasePath);

database.pragma('foreign_keys = ON');

const schema = fs.readFileSync(schemaPath, 'utf8');
database.exec(schema);

module.exports = database;