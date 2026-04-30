// Manejadores
import { readFileSync } from 'node:fs';
import { URL } from 'node:url';
import { config, db } from '../main.js';
import { login, createUser } from './user.js';


export async function login_handler(request, response)
{
    const url = new URL(request.url, 'http://' + config.server.ip);
    const input = Object.fromEntries(url.searchParams);

    const output = login(input);

    response.writeHead(200, { 'Content-Type': 'application/json' });
    response.end(JSON.stringify(output));
}

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

export async function register_handler(request, response)
{
    let body = '';

    request.on('data', chunk =>
    {
        body += chunk;
    });

    request.on('end', async () =>
    {
        const params = new URLSearchParams(body);
        const input = Object.fromEntries(params);

        try 
        {
            const output = await createUser(db, input.username, input.password);        //saque lo harcodeado, puse los inputs para que tome los datos ingresados

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

export function show_message_handler(request, response)
{
    console.log("Petición recibida: Mostrando mensaje en el servidor!");
    response.writeHead(200, { 'Content-Type': 'application/json' });
    response.end(JSON.stringify({ message: "Mensaje procesado" }));
}
