// Lógica de negocio - endpoints
export function createEndpoint(db, path)
{
    const sql = "INSERT INTO endpoint (path) VALUES (?) RETURNING id";

    const stmt = db.prepare(sql);
    const row = stmt.get(path);

    return { id: row.id, path: path };
}

export function deleteEndpoint(db, id)
{
    const sql = "DELETE FROM endpoint WHERE id = ?";

    const stmt = db.prepare(sql);
    const result = stmt.run(id);

    return { deleted: result.changes > 0 };
}

export function updateEndpoint(db, id, path)
{
    const sql = "UPDATE endpoint SET path = ? WHERE id = ?";

    const stmt = db.prepare(sql);
    const result = stmt.run(path, id);

    return { updated: result.changes > 0 };
}

export function getEndpointById(db, id)
{
    const sql = "SELECT id, path FROM endpoint WHERE id = ?";

    const stmt = db.prepare(sql);
    const row = stmt.get(id);

    return row ?? null;
}

export function listEndpoints(db)
{
    const sql = "SELECT id, path FROM endpoint";

    const stmt = db.prepare(sql);
    const rows = stmt.all();

    return rows;
}