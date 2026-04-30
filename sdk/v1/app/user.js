// Lógica de negocio
import { config } from '../main.js';

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


export function login(input)
{
    const userdata =
    {
        username: config.admin.username,
        password: config.admin.password
    };

    let output =
    {
        status: false,
        result: null,
        description: 'INVALID_USER_PASS'
    };

    if (input.username === userdata.username && input.password === userdata.password)
    {
        output.status = true;
        output.result = input.username;
        output.description = null;
    }

    return output;
}