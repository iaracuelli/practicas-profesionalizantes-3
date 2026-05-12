// Ruteo
import { createServer } from 'node:http';
import { URL } from 'node:url';
import { config } from '../main.js';
import { default_handler, login_handler, register_handler, show_message_handler, delete_user_handler, 
        update_user_handler, get_user_by_id_handler, list_users_handler,
        create_group_handler, delete_group_handler, update_group_handler, get_group_by_id_handler, list_groups_handler,
        add_member_handler, remove_member_handler, get_members_by_group_handler, get_groups_by_user_handler,
        create_endpoint_handler, delete_endpoint_handler, update_endpoint_handler, get_endpoint_by_id_handler, list_endpoints_handler,
        add_access_handler, remove_access_handler, get_access_by_group_handler, get_groups_by_endpoint_handler } from './handler.js';


let router = new Map();
router.set('/', default_handler);
router.set('/login', login_handler);
router.set('/register', register_handler);
router.set('/showMessage', show_message_handler);
router.set('/deleteUser', delete_user_handler);
router.set('/updateUser', update_user_handler);
router.set('/getUser', get_user_by_id_handler);
router.set('/listUsers', list_users_handler);
router.set('/createGroup', create_group_handler);
router.set('/deleteGroup', delete_group_handler);
router.set('/updateGroup', update_group_handler);
router.set('/getGroup', get_group_by_id_handler);
router.set('/listGroups', list_groups_handler);
router.set('/addMember', add_member_handler);
router.set('/removeMember', remove_member_handler);
router.set('/getMembersByGroup', get_members_by_group_handler);
router.set('/getGroupsByUser', get_groups_by_user_handler);
router.set('/createEndpoint', create_endpoint_handler);
router.set('/deleteEndpoint', delete_endpoint_handler);
router.set('/updateEndpoint', update_endpoint_handler);
router.set('/getEndpoint', get_endpoint_by_id_handler);
router.set('/listEndpoints', list_endpoints_handler);
router.set('/addAccess', add_access_handler);
router.set('/removeAccess', remove_access_handler);
router.set('/getAccessByGroup', get_access_by_group_handler);
router.set('/getGroupsByEndpoint', get_groups_by_endpoint_handler);

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