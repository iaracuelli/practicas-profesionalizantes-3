// Lógica de negocio - miembros
export function addMember(db, id_user, id_group)
{
    const sql = "INSERT INTO members (id_user, id_group) VALUES (?, ?)";

    const stmt = db.prepare(sql);
    const result = stmt.run(id_user, id_group);

    return { added: result.changes > 0 };
}

export function removeMember(db, id_user, id_group)
{
    const sql = "DELETE FROM members WHERE id_user = ? AND id_group = ?";

    const stmt = db.prepare(sql);
    const result = stmt.run(id_user, id_group);

    return { removed: result.changes > 0 };
}

export function getMembersByGroup(db, id_group)
{
    const sql = `SELECT user.id, user.username 
                 FROM user 
                 INNER JOIN members ON user.id = members.id_user 
                 WHERE members.id_group = ?`;

    const stmt = db.prepare(sql);
    const rows = stmt.all(id_group);

    return rows;
}

export function getGroupsByUser(db, id_user)
{
    const sql = `SELECT "group".id, "group".name 
                 FROM "group" 
                 INNER JOIN members ON "group".id = members.id_group 
                 WHERE members.id_user = ?`;

    const stmt = db.prepare(sql);
    const rows = stmt.all(id_user);

    return rows;
}