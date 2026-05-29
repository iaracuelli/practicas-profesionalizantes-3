import { readFileSync } from 'node:fs';
import { createServer } from 'node:http';
import { request_dispatcher } from './app/router.js';
import { init_database } from './app/database.js';

function default_config() 
{
    const config = 
    {
        server: 
        {
            ip: '127.0.0.1',
            port: 3000,
            default_path: './default.html'
        },
        database: 
        {
            path: './database.db'
        },
         admin:
        {
            username: 'admin',
            password: '1234'
        }
    };

    return config;
}

function load_config() 
{
    let config = null;
    try 
    {
        const data = readFileSync('./config.json', 'utf-8');
        config = JSON.parse(data);
        console.log("Configuración cargada correctamente.");
    } 
    catch (error) 
    {
        console.error("Error cargando config.json. Usando valores por defecto.");
        config = default_config();
    }
    return config;
}

export const config = load_config();

init_database(); 

function start()
{
    console.log('Servidor ejecutándose en http://' + config.server.ip + ':' + config.server.port);
}

const server = createServer(request_dispatcher);
server.listen(config.server.port, config.server.ip, start);
