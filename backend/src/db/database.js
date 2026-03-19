const path = require('path');
const fs = require('fs');
const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const { dbPath } = require('../config/env');
const { seedTickets } = require('./seed');

let databasePromise;

async function getDb() {
  if (!databasePromise) {
    fs.mkdirSync(path.dirname(dbPath), { recursive: true });
    databasePromise = open({
      filename: dbPath,
      driver: sqlite3.Database
    });
  }

  return databasePromise;
}

async function initDatabase() {
  const db = await getDb();

  await db.exec(`
    CREATE TABLE IF NOT EXISTS tickets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      titulo TEXT NOT NULL,
      descripcion TEXT NOT NULL,
      prioridad TEXT NOT NULL,
      responsable TEXT NOT NULL,
      estado TEXT NOT NULL,
      fechaCreacion TEXT NOT NULL
    )
  `);

  await seedTickets(db);

  return db;
}

async function resetDatabase() {
  const db = await getDb();

  await db.exec(`
    DELETE FROM tickets;
    DELETE FROM sqlite_sequence WHERE name = 'tickets';
  `);

  await seedTickets(db, { force: true });
}

async function closeDatabase() {
  if (!databasePromise) {
    return;
  }

  const db = await databasePromise;
  await db.close();
  databasePromise = null;
}

module.exports = {
  getDb,
  initDatabase,
  resetDatabase,
  closeDatabase
};