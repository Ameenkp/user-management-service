import dotenv from 'dotenv';
import { App } from './src/app';
import {UserManagementServiceConstants} from "./src/config/userManagementServiceConstants";

class Server {
    private app: App;

    constructor() {
        this.app = new App();
    }

    async start() {
        const port = UserManagementServiceConstants.USER_MANAGEMENT_SERVICE_PORT;
        this.app.start(port);
    }
}

const server = new Server();
server.start();
