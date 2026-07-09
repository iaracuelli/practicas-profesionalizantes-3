// Manejadores
import { readFileSync } from 'node:fs';
import { URL } from 'node:url';
import { config } from '../main.js';
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
        const output = login(input.username, input.password);

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
            const output = await createUser(input.username, input.password);

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
        const output = deleteUser(input.id);

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
        const output = updateUser(input.id, input.username, input.password);

        response.writeHead(200, { 'Content-Type': 'application/json' });
        response.end(JSON.stringify(output));
    });
}

export function get_user_by_id_handler(request, response)
{
    const url = new URL(request.url, 'http://' + config.server.ip);
    const id = url.searchParams.get('id');

    const output = getUserById(id);

    response.writeHead(200, { 'Content-Type': 'application/json' });
    response.end(JSON.stringify(output));
}

export function list_users_handler(request, response)
{
    const output = listUsers();

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
        const output = createGroup(input.name);

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
        const output = deleteGroup(input.id);

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
        const output = updateGroup(input.id, input.name);

        response.writeHead(200, { 'Content-Type': 'application/json' });
        response.end(JSON.stringify(output));
    });
}

export function get_group_by_id_handler(request, response)
{
    const url = new URL(request.url, 'http://' + config.server.ip);
    const id = url.searchParams.get('id');

    const output = getGroupById(id);

    response.writeHead(200, { 'Content-Type': 'application/json' });
    response.end(JSON.stringify(output));
}

export function list_groups_handler(request, response)
{
    const output = listGroups();

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
        const output = addMember(input.id_user, input.id_group);

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

        const output = removeMember(input.id_user, input.id_group);

        response.writeHead(200, { 'Content-Type': 'application/json' });
        response.end(JSON.stringify(output));
    });
}

export function get_members_by_group_handler(request, response)
{
    const url = new URL(request.url, 'http://' + config.server.ip);
    const id_group = url.searchParams.get('id_group');

    const output = getMembersByGroup(id_group);

    response.writeHead(200, { 'Content-Type': 'application/json' });
    response.end(JSON.stringify(output));
}

export function get_groups_by_user_handler(request, response)
{
    const url = new URL(request.url, 'http://' + config.server.ip);
    const id_user = url.searchParams.get('id_user');

    const output = getGroupsByUser(id_user);

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
        const output = createEndpoint(input.path);

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
        const output = deleteEndpoint(input.id);

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
        const output = updateEndpoint(input.id, input.path);

        response.writeHead(200, { 'Content-Type': 'application/json' });
        response.end(JSON.stringify(output));
    });
}

export function get_endpoint_by_id_handler(request, response)
{
    const url = new URL(request.url, 'http://' + config.server.ip);
    const id = url.searchParams.get('id');

    const output = getEndpointById(id);

    response.writeHead(200, { 'Content-Type': 'application/json' });
    response.end(JSON.stringify(output));
}

export function list_endpoints_handler(request, response)
{
    const output = listEndpoints();

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
        const output = addAccess(input.id_group, input.id_endpoint);

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
        const output = removeAccess(input.id_group, input.id_endpoint);

        response.writeHead(200, { 'Content-Type': 'application/json' });
        response.end(JSON.stringify(output));
    });
}

export function get_access_by_group_handler(request, response)
{
    const url = new URL(request.url, 'http://' + config.server.ip);
    const id_group = url.searchParams.get('id_group');

    const output = getAccessByGroup(id_group);

    response.writeHead(200, { 'Content-Type': 'application/json' });
    response.end(JSON.stringify(output));
}

export function get_groups_by_endpoint_handler(request, response)
{
    const url = new URL(request.url, 'http://' + config.server.ip);
    const id_endpoint = url.searchParams.get('id_endpoint');

    const output = getGroupsByEndpoint(id_endpoint);

    response.writeHead(200, { 'Content-Type': 'application/json' });
    response.end(JSON.stringify(output));
}

export function show_message_handler(request, response)
{
    console.log("Petición recibida: Mostrando mensaje en el servidor!");
    response.writeHead(200, { 'Content-Type': 'application/json' });
    response.end(JSON.stringify({ message: "Mensaje procesado" }));
}