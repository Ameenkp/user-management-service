import { Router } from 'express';
import {AuthenticationController} from "../controller/authenticationController";
import {UserManagementServiceConstants} from "../config/userManagementServiceConstants";
export class AuthenticationRouter {
    private readonly router: Router;
    private authController: AuthenticationController;

    constructor() {
        this.router = Router();
        this.authController = new AuthenticationController();
        this.setupRoutes();
    }

    private setupRoutes() {
        this.router.post(UserManagementServiceConstants.USER_MANAGEMENT_SERVICE_ACCOUNT_MSISDN_OTP_REQEUST_URL_PART, this.authController.handleEvent);
        // this.router.patch('/user/:userId', AuthMiddleware.authenticate, AuthController.userUpdate);
    }

    public getRouter() {
        return this.router;
    }
}
