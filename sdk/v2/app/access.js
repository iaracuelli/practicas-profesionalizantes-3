// Lógica de negocio - accesos
export function addAccess(db, id_group, id_endpoint)
{
    const sql = "INSERT INTO access (id_group, id_endpoint) VALUES (?, ?)";

    const stmt = db.prepare(sql);
    const result = stmt.run(id_group, id_endpoint);

    return { added: result.changes > 0 };
}

export function removeAccess(db, id_group, id_endpoint)
{
    const sql = "DELETE FROM access WHERE id_group = ? AND id_endpoint = ?";

    const stmt = db.prepare(sql);
    const result = stmt.run(id_group, id_endpoint);

    return { removed: result.changes > 0 };
}

export function getAccessByGroup(db, id_group)
{
    const sql = `SELECT endpoint.id, endpoint.path 
                 FROM endpoint 
                 INNER JOIN access ON endpoint.id = access.id_endpoint 
                 WHERE access.id_group = ?`;

    const stmt = db.prepare(sql);
    const rows = stmt.all(id_group);

    return rows;
}

export function getGroupsByEndpoint(db, id_endpoint)
{
    const sql = `SELECT "group".id, "group".name 
                 FROM "group" 
                 INNER JOIN access ON "group".id = access.id_group 
                 WHERE access.id_endpoint = ?`;

    const stmt = db.prepare(sql);
    const rows = stmt.all(id_endpoint);

    return rows;
}