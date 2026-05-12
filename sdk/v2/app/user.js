// Lógica de negocio
import { db } from '../main.js';

export async function createUser(db, username, password) 
{
    const sql = "INSERT INTO user (username, password) VALUES (?, ?) RETURNING id";

    try 
    {
        const stmt = db.prepare(sql);
        const row = stmt.get(username, password);

        const result = 
        {
            id: row.id,
            username: username,
            password: password
        };
        
        return result;
    } 
    catch (err) 
    {
        throw err;
    }
}

export function deleteUser(db, id)
{
    const sql = "DELETE FROM user WHERE id = ?";

    const stmt = db.prepare(sql);
    const result = setImmediate.run(id);

    return {deleted: result.changes > 0 };
}

export function updateUser(db, id, username, password)
{
    const sql = "UPDATE user SET username = ?, password = ? WHERE id = ?";

    const stmt = db.prepare(sql);
    const result = stmt.run(username, password, id);

    return { updated: result.changes > 0 };
}

export function getUserById(db, id)
{
    const sql = "SELECT id, username FROM user WHERE id = ?";

    const stmt = db.prepare(sql);
    const row = stmt.get(id);

    return row ?? null;
}

export function listUsers(db)
{
    const sql = "SELECT id, username FROM user";

    const stmt = db.prepare(sql);
    const row = stmt.all();

    return row;
}


export function login(input)
{
    const sql = "SELECT id, username FROM user WHERE username = ? AND password = ?";

    const stmt = db.prepare(sql);
    const row = stmt.get(username, password);

    if (row)
    {
        return { status: true, result: row.username, description: null};
    }

    return { status: false, result: null, description: 'INVALID_USER_PASS'};
}