// Ruteo
import { createServer } from 'node:http';
import { URL } from 'node:url';
import { config } from '../main.js';
import { default_handler, login_handler, register_handler, show_message_handler } from './handler.js';


let router = new Map();
router.set('/', default_handler);
router.set('/login', login_handler);
router.set('/register', register_handler);
router.set('/showMessage', show_message_handler);

async function request_dispatcher(request, response)
{
    const url = new URL(request.url, 'http://' + config.server.ip);
    const path = url.pathname;
    const handler = router.get(path);

    if (handler)
    {
        return await handler(request, response);
    }
    else
    {
        response.writeHead(404);
        response.end('Método no encontrado');
    }
}

function start()
{
    console.log('Servidor ejecutándose en http://' + config.server.ip + ':' + config.server.port);
}

export function init_server()
{
    let server = createServer(request_dispatcher);
    server.listen(config.server.port, config.server.ip, start);
}