import express, { Application, Request, Response, NextFunction } from 'express';
import morgan from 'morgan';
import cors from 'cors';
import * as http from 'http';
import path from 'path';
import {AuthenticationRouter} from "./route/authenticationRouter";
import {UserManagementServiceConstants} from "./config/userManagementServiceConstants";

export class App {
    public readonly app: Application;
    readonly server: http.Server;

    constructor() {
        this.app = express();
        this.server = http.createServer(this.app);
        this.appConfig();
        this.routeMountings();
        this.serveStaticFiles();
    }

    /**
     * A function that configures the app for development environment,
     * adding middleware for logging, CORS, JSON and URL encoding, and cookie parsing.
     *
     * @param {void} - This function does not take any parameters
     * @return {void} - This function does not return any value
     */
    public appConfig(): void {
        if ((process.env.NODE_ENV as string) !== 'production') {
            this.app.use(morgan('dev'));
        }
        this.app.use(cors({ origin: '*', methods: ['GET', 'POST'] }));
        this.app.use(express.json());
        this.app.use(express.urlencoded({ extended: true }));
    }

    /**
     *  It attaches a route for the root URL that responds with a simple message,
     *  and also mounts two routers under the /api/messenger path.
     */
    public routeMountings(): void {
        this.app.use(UserManagementServiceConstants.USER_MANAGEMENT_SERVICE_ACCOUNT_MSISDN_URL_PREFIX, new AuthenticationRouter().getRouter());
    }

    public serveStaticFiles(): void {
        const staticFilesDir = path.join(__dirname, '../public');
        this.app.use(express.static(staticFilesDir));
    }


    public start(port: number): void {
        this.server.listen(port, () => {
            console.log(`Server is running on port ${port}`);
        });
    }
}
