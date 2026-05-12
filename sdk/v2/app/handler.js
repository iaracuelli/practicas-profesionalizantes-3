// Manejadores
import { readFileSync } from 'node:fs';
import { URL } from 'node:url';
import { config, db } from '../main.js';
import { login, createUser, deleteUser, updateUser, getUserById, listUsers } from './user.js';
import { createGroup, deleteGroup, updateGroup, getGroupById, listGroups } from './group.js';
import { addMember, removeMember, getMembersByGroup, getGroupsByUser } from './members.js';
import { createEndpoint, deleteEndpoint, updateEndpoint, getEndpointById, listEndpoints } from './endpoint.js';
import { addAccess, removeAccess, getAccessByGroup, getGroupsByEndpoint } from './access.js';

export function default_handler(request, response)
{
    try
    {
        const html = readFileSync(config.server.default_path, 'utf-8');
        response.writeHead(200, { 'Content-Type': 'text/html' });
        response.end(html);
    }
    catch (error)
    {
        response.writeHead(500);
        response.end('Error interno: No se pudo cargar la vista principal.');
    }
}

export async function login_handler(request, response)
{
    let body = '';

    request.on('data', chunk =>
    {
        body += chunk;
    });

    request.on('end', () =>
    {
        const input = JSON.parse(body);
        const output = login(db, input.username, input.password);

        response.writeHead(200, { 'Content-Type': 'application/json' });
        response.end(JSON.stringify(output));
    });
}

export async function register_handler(request, response)
{
    let body = '';

    request.on('data', chunk =>
    {
        body += chunk;
    });

    request.on('end', async () =>
    {
        const input = JSON.parse(body);

        try
        {
            const output = await createUser(db, input.username, input.password);

            response.writeHead(200, { 'Content-Type': 'application/json' });
            response.end(JSON.stringify(output));
        }
        catch (err)
        {
            response.writeHead(500);
            response.end(JSON.stringify({ error: err.message }));
        }
    });
}

export async function delete_user_handler(request, response)
{
    let body = '';

    request.on('data', chunk =>
    {
        body += chunk;
    });

    request.on('end', () =>
    {
        const input = JSON.parse(body);
        const output = deleteUser(db, input.id);

        response.writeHead(200, { 'Content-Type': 'application/json' });
        response.end(JSON.stringify(output));
    });
}

export async function update_user_handler(request, response)
{
    let body = '';

    request.on('data', chunk =>
    {
        body += chunk;
    });

    request.on('end', () =>
    {
        const input = JSON.parse(body);
        const output = updateUser(db, input.id, input.username, input.password);

        response.writeHead(200, { 'Content-Type': 'application/json' });
        response.end(JSON.stringify(output));
    });
}

export function get_user_by_id_handler(request, response)
{
    const url = new URL(request.url, 'http://' + config.server.ip);
    const id = url.searchParams.get('id');

    const output = getUserById(db, id);

    response.writeHead(200, { 'Content-Type': 'application/json' });
    response.end(JSON.stringify(output));
}

export function list_users_handler(request, response)
{
    const output = listUsers(db);

    response.writeHead(200, { 'Content-Type': 'application/json' });
    response.end(JSON.stringify(output));
}

//-------------------------------------------------------------------
export function create_group_handler(request, response)
{
    let body = '';

    request.on('data', chunk =>
    {
        body += chunk;
    });

    request.on('end', () =>
    {
        const input = JSON.parse(body);
        const output = createGroup(db, input.name);

        response.writeHead(200, { 'Content-Type': 'application/json' });
        response.end(JSON.stringify(output));
    });
}

export function delete_group_handler(request, response)
{
    let body = '';

    request.on('data', chunk =>
    {
        body += chunk;
    });

    request.on('end', () =>
    {
        const input = JSON.parse(body);
        const output = deleteGroup(db, input.id);

        response.writeHead(200, { 'Content-Type': 'application/json' });
        response.end(JSON.stringify(output));
    });
}

export function update_group_handler(request, response)
{
    let body = '';

    request.on('data', chunk =>
    {
        body += chunk;
    });

    request.on('end', () =>
    {
        const input = JSON.parse(body);
        const output = updateGroup(db, input.id, input.name);

        response.writeHead(200, { 'Content-Type': 'application/json' });
        response.end(JSON.stringify(output));
    });
}

export function get_group_by_id_handler(request, response)
{
    const url = new URL(request.url, 'http://' + config.server.ip);
    const id = url.searchParams.get('id');

    const output = getGroupById(db, id);

    response.writeHead(200, { 'Content-Type': 'application/json' });
    response.end(JSON.stringify(output));
}

export function list_groups_handler(request, response)
{
    const output = listGroups(db);

    response.writeHead(200, { 'Content-Type': 'application/json' });
    response.end(JSON.stringify(output));
}

//--------------------------------------------------------------------
export function add_member_handler(request, response)
{
    let body = '';

    request.on('data', chunk =>
    {
        body += chunk;
    });

    request.on('end', () =>
    {
        const input = JSON.parse(body);
        const output = addMember(db, input.id_user, input.id_group);

        response.writeHead(200, { 'Content-Type': 'application/json' });
        response.end(JSON.stringify(output));
    });
}

export function remove_member_handler(request, response)
{
    let body = '';

    request.on('data', chunk =>
    {
        body += chunk;
    });

    request.on('end', () =>
    {
        const input = JSON.parse(body);

        const output = removeMember(db, input.id_user, input.id_group);

        response.writeHead(200, { 'Content-Type': 'application/json' });
        response.end(JSON.stringify(output));
    });
}

export function get_members_by_group_handler(request, response)
{
    const url = new URL(request.url, 'http://' + config.server.ip);
    const id_group = url.searchParams.get('id_group');

    const output = getMembersByGroup(db, id_group);

    response.writeHead(200, { 'Content-Type': 'application/json' });
    response.end(JSON.stringify(output));
}

export function get_groups_by_user_handler(request, response)
{
    const url = new URL(request.url, 'http://' + config.server.ip);
    const id_user = url.searchParams.get('id_user');

    const output = getGroupsByUser(db, id_user);

    response.writeHead(200, { 'Content-Type': 'application/json' });
    response.end(JSON.stringify(output));
}

//-----------------------------------------------------------------------
export function create_endpoint_handler(request, response)
{
    let body = '';

    request.on('data', chunk =>
    {
        body += chunk;
    });

    request.on('end', () =>
    {
        const input = JSON.parse(body);
        const output = createEndpoint(db, input.path);

        response.writeHead(200, { 'Content-Type': 'application/json' });
        response.end(JSON.stringify(output));
    });
}

export function delete_endpoint_handler(request, response)
{
    let body = '';

    request.on('data', chunk =>
    {
        body += chunk;
    });

    request.on('end', () =>
    {
        const input = JSON.parse(body);
        const output = deleteEndpoint(db, input.id);

        response.writeHead(200, { 'Content-Type': 'application/json' });
        response.end(JSON.stringify(output));
    });
}

export function update_endpoint_handler(request, response)
{
    let body = '';

    request.on('data', chunk =>
    {
        body += chunk;
    });

    request.on('end', () =>
    {
        const input = JSON.parse(body);
        const output = updateEndpoint(db, input.id, input.path);

        response.writeHead(200, { 'Content-Type': 'application/json' });
        response.end(JSON.stringify(output));
    });
}

export function get_endpoint_by_id_handler(request, response)
{
    const url = new URL(request.url, 'http://' + config.server.ip);
    const id = url.searchParams.get('id');

    const output = getEndpointById(db, id);

    response.writeHead(200, { 'Content-Type': 'application/json' });
    response.end(JSON.stringify(output));
}

export function list_endpoints_handler(request, response)
{
    const output = listEndpoints(db);

    response.writeHead(200, { 'Content-Type': 'application/json' });
    response.end(JSON.stringify(output));
}

//-----------------------------------------------------------------
export function add_access_handler(request, response)
{
    let body = '';

    request.on('data', chunk =>
    {
        body += chunk;
    });

    request.on('end', () =>
    {
        const input = JSON.parse(body);
        const output = addAccess(db, input.id_group, input.id_endpoint);

        response.writeHead(200, { 'Content-Type': 'application/json' });
        response.end(JSON.stringify(output));
    });
}

export function remove_access_handler(request, response)
{
    let body = '';

    request.on('data', chunk =>
    {
        body += chunk;
    });

    request.on('end', () =>
    {
        const input = JSON.parse(body);
        const output = removeAccess(db, input.id_group, input.id_endpoint);

        response.writeHead(200, { 'Content-Type': 'application/json' });
        response.end(JSON.stringify(output));
    });
}

export function get_access_by_group_handler(request, response)
{
    const url = new URL(request.url, 'http://' + config.server.ip);
    const id_group = url.searchParams.get('id_group');

    const output = getAccessByGroup(db, id_group);

    response.writeHead(200, { 'Content-Type': 'application/json' });
    response.end(JSON.stringify(output));
}

export function get_groups_by_endpoint_handler(request, response)
{
    const url = new URL(request.url, 'http://' + config.server.ip);
    const id_endpoint = url.searchParams.get('id_endpoint');

    const output = getGroupsByEndpoint(db, id_endpoint);

    response.writeHead(200, { 'Content-Type': 'application/json' });
    response.end(JSON.stringify(output));
}

export function show_message_handler(request, response)
{
    console.log("Petición recibida: Mostrando mensaje en el servidor!");
    response.writeHead(200, { 'Content-Type': 'application/json' });
    response.end(JSON.stringify({ message: "Mensaje procesado" }));
}