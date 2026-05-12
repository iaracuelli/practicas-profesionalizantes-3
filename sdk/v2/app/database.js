// app/database.js
import { db } from '../main.js';

export function init_database()
{
    db.exec(`
        CREATE TABLE IF NOT EXISTS user (
            id INTEGER NOT NULL,
            username TEXT NOT NULL,
            password TEXT NOT NULL,
            PRIMARY KEY(id AUTOINCREMENT)
        );

        CREATE TABLE IF NOT EXISTS "group" (
            id INTEGER NOT NULL,
            name TEXT NOT NULL UNIQUE,
            PRIMARY KEY(id AUTOINCREMENT)
        );

        CREATE TABLE IF NOT EXISTS members (
            id_user INTEGER NOT NULL,
            id_group INTEGER NOT NULL,
            PRIMARY KEY(id_user, id_group),
            FOREIGN KEY(id_user) REFERENCES user(id),
            FOREIGN KEY(id_group) REFERENCES "group"(id)
        );

        CREATE TABLE IF NOT EXISTS endpoint (
            id INTEGER NOT NULL,
            path TEXT NOT NULL UNIQUE,
            PRIMARY KEY(id AUTOINCREMENT)
        );

        CREATE TABLE IF NOT EXISTS access (
            id_group INTEGER NOT NULL,
            id_endpoint INTEGER NOT NULL,
            PRIMARY KEY(id_group, id_endpoint),
            FOREIGN KEY(id_endpoint) REFERENCES endpoint(id),
            FOREIGN KEY(id_group) REFERENCES "group"(id)
        );
    `);

    console.log("Base de datos inicializada.");
}