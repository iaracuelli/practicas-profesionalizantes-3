// Lógica de negocio - grupos
import { db } from '../main.js';

export function createGroup(db, name)
{
    const sql = "INSERT INTO \"group\" (name) VALUES (?) RETURNING id";

    const stmt = db.prepare(sql);
    const row = stmt.get(name);

    return { id: row.id, name: name };
}

export function deleteGroup(db, id)
{
    const sql = "DELETE FROM \"group\" WHERE id = ?";

    const stmt = db.prepare(sql);
    const result = stmt.run(id);

    return { deleted: result.changes > 0 };
}

export function updateGroup(db, id, name)
{
    const sql = "UPDATE \"group\" SET name = ? WHERE id = ?";

    const stmt = db.prepare(sql);
    const result = stmt.run(name, id);

    return { updated: result.changes > 0 };
}

export function getGroupById(db, id)
{
    const sql = "SELECT id, name FROM \"group\" WHERE id = ?";

    const stmt = db.prepare(sql);
    const row = stmt.get(id);

    return row ?? null;
}

export function listGroups(db)
{
    const sql = "SELECT id, name FROM \"group\"";

    const stmt = db.prepare(sql);
    const rows = stmt.all();

    return rows;
}