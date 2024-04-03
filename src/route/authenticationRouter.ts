import { Router } from 'express';
import {AuthenticationController} from "../controller/authenticationController";
import {UserManagementServiceConstants} from "../config/userManagementServiceConstants";
import {SignupController} from "../controller/signupController";
export class AuthenticationRouter {
    private readonly router: Router;
    private authController: AuthenticationController;
    private signupController: SignupController;

    constructor() {
        this.router = Router();
        this.authController = new AuthenticationController();
        this.signupController = new SignupController();
        this.setupRoutes();
    }

    private setupRoutes() {

        this.router.post(UserManagementServiceConstants.USER_MANAGEMENT_SERVICE_ACCOUNT_MSISDN_OTP_REQUEST_URL_PART, this.authController.initAuthMSISDNOTPRequest);
        this.router.post(UserManagementServiceConstants.USER_MANAGEMENT_SERVICE_ACCOUNT_MSISDN_OTP_VERIFY_URL_PART, this.authController.initAuthMSISDNOTPVerify);
        this.router.post(UserManagementServiceConstants.USER_MANAGEMENT_SERVICE_ACCOUNT_TOKEN_REFRESH, this.authController.refreshToken);

        this.router.post(UserManagementServiceConstants.USER_MANAGEMENT_SERVICE_ACCOUNT_PHONE_SIGNUP_URL_PART, this.signupController.phoneSignUpHandler);
        this.router.post(UserManagementServiceConstants.USER_MANAGEMENT_SERVICE_ACCOUNT_PHONE_VERIFY_SIGNUP_URL_PART, this.signupController.phoneSignupVerifyHandler);


    }

    public getRouter() {
        return this.router;
    }
}
