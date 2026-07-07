import { createServer } from 'node:http';
import { URL } from 'node:url';
import { access, readFileSync } from 'node:fs';
import { DatabaseSync } from 'node:sqlite';
import { resolve } from 'node:path';

function default_config() 
{
    const config = 
    {
        server: 
        {
            ip: '127.0.0.1',
            port: 3000,
            default_path: './index.html'
        },
        database: 
        {
            path: './database.db'
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

const config = load_config();


function connect_db(path) 
{
    const dbPath = resolve(path);
    try 
    {
        const db = new DatabaseSync(dbPath);
        return db;
    } 
    catch (err) 
    {
        throw new Error("Error al conectar a la base de datos: " + err.message);
    }
}


let userSessions = new Map();  //clave-valor  -> clave: id_user,  valor: sessionObj

class UserSession
{
    constructor()
    {
       this.status = 'disabled';
    }

}

const db = connect_db(config.database.path);
//const output = await createUser(db, 'test', '123456789');

function authenticate( username, access_key )
{
    const sql = `SELECT count(*) as total FROM "user" WHERE username=? AND access_key=?`;

    try 
    {
        const stmt = db.prepare(sql);
        const row = stmt.get(username, access_key);
            
        return (row.total > 0);
    } 
    catch (err) 
    {
        throw err;
    }
}


function authorize( username, endpointPath )
{
    const sql = `
        SELECT count(*) as total
        FROM access a
        JOIN members m ON a.id_group = m.id_group
        JOIN user u ON m.id_user = u.id
        JOIN endpoint e ON a.id_endpoint = e.id
        WHERE u.username = ? 
          AND e.path = ?
    `;

    try {
        const stmt = db.prepare(sql);
        // Paso los parametros en el orden de los signos de interrogación
        const row = stmt.get(username, endpointPath);

        // Si el conteo es mayor a 0, tiene permiso
        return row.total > 0;
    } catch (err) {
        console.error("Error consultando permisos:", err);
        throw err;
    }
}

function login( username, access_key )
{
    
    let isAuthenticated = authenticate(username, access_key);

    if ( isAuthenticated )
    {
        let havePreviousSession = userSessions.get(username);

        if ( havePreviousSession == null )
        {
            //Significa que esta ingresando por primera vez. Entonces, creo y persisto el objeto de sesion
            let newSession = new UserSession();
            newSession.status = 'enabled';
            newSession.type = 'new';
            userSessions.set(username, newSession );
            return newSession;
        }
        else
        {
            //Significa que ya ingreso en algún momento y tiene ya un objeto de sesion creado y guardado en el mapa.
            let previousSession = userSessions.get(username);

            if ( previousSession.status == 'disabled')
            {
                previousSession.status = 'enabled';
            }

            previousSession.type = 'recovered';
            return previousSession;
        }
    }
    else
    {
        return null;
    }

    //El retorno de esta funcion esta representando si se devuelve o no un objeto de sesion.
}

function logout(username, access_key)
{
    let isAuthenticated = authenticate(username, access_key);

    if ( isAuthenticated )
    {
        let currentSession = userSessions.get(username);
        currentSession.status = 'disabled';
        return true;
    }

    return false;
}

// Logica de negocio
async function createUser(db, username, password) 
{
    const sql = "INSERT INTO user (username, access_key) VALUES (?, ?) RETURNING id";

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



// Manejadores
async function login_handler(request, response)
{
    if ( request.method == "POST" )
    {
        const username = request.headers['x-user-id'];
        const access_key = request.headers['x-api-key'];

        const output = login(username, access_key);

        if (output == null)
        {
            response.writeHead(401, { 'Content-Type': 'application/json' });
            response.end(JSON.stringify({ exception: 'INVALID_CREDENTIALS', detail: ['Usuario o contraseña incorrectos'] }));
            return;
        }

        response.writeHead(200, { 'Content-Type': 'application/json' });
        response.end(JSON.stringify(output));

    }
    else
    {
        response.writeHead(400, { 'Content-Type': 'application/json' });
        response.end(JSON.stringify({ exception: 'INVALID_METHOD', detail: ['Se espera POST'] }));
        return;
    }
}

async function logout_handler(request, response)
{
      if ( request.method == "POST" )
    {
        const username = request.headers['x-user-id'];
        const access_key = request.headers['x-api-key'];

        const success = logout(username, access_key);

        if (!success)
        {
            response.writeHead(401, { 'Content-Type': 'application/json' });
            response.end(JSON.stringify({ exception: 'INVALID_CREDENTIALS', detail: ['Usuario o contraseña incorrectos'] }));
            return;
        }

        response.writeHead(200, { 'Content-Type': 'application/json' });
        response.end(JSON.stringify({ status: 'logged out' }));
    }
    else
    {
        response.writeHead(400, { 'Content-Type': 'application/json' });
        response.end(JSON.stringify({ exception: 'INVALID_METHOD', detail: ['Se espera POST'] }));
        return;
    }
}

async function register_handler(request, response)
{
    if (request.method !== 'POST')
    {
        response.writeHead(400, { 'Content-Type': 'application/json' });
        response.end(JSON.stringify({ exception: 'INVALID_METHOD', detail: ['Se espera POST'] }));
        return;
    }

    let body = '';
    request.on('data', chunk => { body += chunk.toString(); });

    request.on('end', async () =>
    {
        try
        {
            const input = JSON.parse(body);
            const output = await createUser(db, input.username, input.access_key);

            response.writeHead(200, { 'Content-Type': 'application/json' });
            response.end(JSON.stringify(output));
        }
        catch (err)
        {
            response.writeHead(500, { 'Content-Type': 'application/json' });
            response.end(JSON.stringify({ exception: 'INTERNAL_ERROR', detail: [err.message] }));
        }
    });
}


function show_message_handler(request, response)
{
    if (request.method !== 'POST')
    {
        response.writeHead(400, { 'Content-Type': 'application/json' });
        response.end(JSON.stringify({ exception: 'INVALID_METHOD', detail: ['Se espera POST'] }));
        return;
    }

    console.log("Petición recibida: Mostrando mensaje en el servidor!");
    response.writeHead(200, { 'Content-Type': 'application/json' });
    response.end(JSON.stringify({ message: "Mensaje procesado" }));
}

// Ruteo
let router = new Map();
//router.set('/', default_handler);
router.set('/login', login_handler);
router.set('/logout', logout_handler);

router.set('/register', register_handler);
router.set('/showMessage', show_message_handler);


router.set('/log', (req, res) => {
    if (req.method !== 'POST')
    {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ exception: 'INVALID_METHOD', detail: ['Se espera POST'] }));
        return;
    }
    res.writeHead(200, { 'Content-Type': 'application/json'});
    res.end(JSON.stringify({ message: 'Ejecutando /log' }));
});

router.set('/sayHello', (req, res) => {
    if (req.method !== 'POST')
    {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ exception: 'INVALID_METHOD', detail: ['Se espera POST'] }));
        return;
    }
    res.writeHead(200, { 'Content-Type': 'application/json'});
    res.end(JSON.stringify({ message: 'Ejecutando /sayHello' }));
});


const publicRoutes = [ '/login', '/logout'];

async function request_dispatcher(request, response)
{
    response.setHeader('Access-Control-Allow-Origin', '*');
    response.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    response.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-user-id, x-api-key'); //X-User-ID X-User-Accesskey
    response.setHeader('X-API-Version', '1.0'); 
    
    if (request.method === 'OPTIONS') 
    {
        response.writeHead(204);
        response.end();
        return;
    }

    const url = new URL(request.url, 'http://' + config.server.ip);
    const path = url.pathname;
    const handler = router.get(path);

    if (!handler)
    {
        response.writeHead(400, { 'Content-Type': 'application/json' });
        response.end(JSON.stringify({ exception: 'NOT_FOUND', detail: ['Ruta no encontrada'] }));
        return;
    }
    
    //si la ruta es publica, pasa
    if (publicRoutes.includes(path))
    {
        return await handler (request, response);
    }

    //ruta privada, verificamos username
    const username = request.headers['x-user-id'];

    if (!username)
    {
        response.writeHead(401, { 'Content-Type': 'application/json' });
        response.end(JSON.stringify({ exception: 'UNAUTHORIZED', detail: ['Usuario no identificado'] }));
        return;
    }

    const isAuthorized = authorize(username, path);

    if(!isAuthorized)
    {
        response.writeHead(401, { 'Content-Type': 'application/json' });
        response.end(JSON.stringify({ exception: 'FORBIDDEN', detail: ['Acceso denegado'] }));
        return;
    }

    return await handler(request, response);
}

function start()
{
    console.log('Servidor ejecutándose en http://' + config.server.ip + ':' + config.server.port);
}

let server = createServer(request_dispatcher);
server.listen(config.server.port, config.server.ip, start);