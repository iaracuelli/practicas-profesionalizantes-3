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
        // Pasamos los parámetros en el orden de los signos de interrogación
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
            //Significa que está ingresando por primera vez. Entonces, creo y persisto el objeto de sesión
            let newSession = new UserSession();
            newSession.status = 'enabled';
            newSession.type = 'new';
            userSessions.set(username, newSession );
            return newSession;
        }
        else
        {
            //Significa que ya ingresó en algún momento y tiene ya un objeto de sesión creado y guardado en el mapa.
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

    //El retorno de esta función está representando si se devuelve o no un objeto de sesión.
}

function logout(username, access_key)
{
    let isAuthenticated = authenticate(username, access_key);

    if ( isAuthenticated )
    {
        let currentSession = userSessions.get(username);
        currentSession.status = 'disabled';
    }
}

// Lógica de negocio
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
    const url = new URL(request.url, 'http://' + config.server.ip);
    
    if ( request.method == "POST" )
    {
       let body = '';
        request.on('data', chunk => {
            body += chunk.toString();
        });

        request.on('end', async () => 
        {
            try 
            {
                // 3. Convertimos el string a objeto (asumiendo que envían JSON)
                const input = JSON.parse(body);

                const authResult = authenticate(input.username, input.access_key);
               
                // 4. Procesamos el login
                const output = login(input.username, input.access_key); //El resultado es nulo o un objeto de sesión

                response.writeHead(200, { 'Content-Type': 'application/json' });
                response.end(JSON.stringify(output));
            } 
            catch (err) 
            {
                response.writeHead(400, { 'Content-Type': 'application/json' });
                response.end(JSON.stringify({ error: 'Formato JSON inválido' }));
            }
        });
    }
    else
    {
        response.writeHead(405, { 'Content-Type': 'application/json' });
        response.end(JSON.stringify({ error: 'Método no permitido. Usa POST.' }));
        return;
    }
  
    
}

async function logout_handler(request, response)
{
       let body = '';
        request.on('data', chunk => {
            body += chunk.toString();
        });

        request.on('end', () => 
        {
            try 
            {
                const input = JSON.parse(body);
                logout(input.username, input.access_key);

                response.writeHead(200, { 'Content-Type': 'application/json' });
                response.end(JSON.stringify({ status: 'logged out' }));
            } 
            catch (err) 
            {
                response.writeHead(500, { 'Content-Type': 'application/json' });
                response.end(JSON.stringify({ error: err.message }));
            }
        });
}

function default_handler(request, response)
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

async function register_handler(request, response)
{
    //Caso GET
    const url = new URL(request.url, 'http://' + config.server.ip);
    const input = Object.fromEntries(url.searchParams);

    try 
    {
        const output = await createUser(db, 'test', '123456789');

        response.writeHead(200, { 'Content-Type': 'application/json' });
        response.end(JSON.stringify(output));
    }
    catch (err)
    {
        response.writeHead(500);
        response.end(JSON.stringify({ error: err.message }));
    }
}


function show_message_handler(request, response)
{
    console.log("Petición recibida: Mostrando mensaje en el servidor!");
    response.writeHead(200, { 'Content-Type': 'application/json' });
    response.end(JSON.stringify({ message: "Mensaje procesado" }));
}

// Ruteo
let router = new Map();
router.set('/', default_handler);
router.set('/login', login_handler);
router.set('/logout', logout_handler);

router.set('/register', register_handler);
router.set('/showMessage', show_message_handler);


router.set('/log', (req, res) => {
    res.writeHead(200, { 'Content-Type': 'application/json'});
    res.end(JSON.stringify({ message: 'Ejecutando /log' }));
});

router.set('/sayHello', (req, res) => {
    res.writeHead(200, { 'Content-Type': 'application/json'});
    res.end(JSON.stringify({ message: 'Ejecutando /sayHello' }));
});


const publicRoutes = [ '/', '/login', '/logout'];

async function request_dispatcher(request, response)
{
    const url = new URL(request.url, 'http://' + config.server.ip);
    const path = url.pathname;
    const handler = router.get(path);

    if (!handler)
    {
        response.writeHead(404);
        response.end('Metodo no encontrado');
        return;
    }
    
    //si la ruta es publica, pasa
    if (publicRoutes.includes(path))
    {
        return await handler (request, response);
    }

    //ruta privada, verificamos username
    const username = request.headers['x-username'];

    if (!username)
    {
        response.writeHead(401, { 'Content-Type': 'application/json' });
        response.end(JSON.stringify({ error: 'Usuario no identificado' }));
        return;
    }

    const isAuthorized = authorize(username, path);

    if(!isAuthorized)
    {
        response.writeHead(403, { 'Content-Type': 'application/json' });
        response.end(JSON.stringify({ error: 'Acceso denegado' }));
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