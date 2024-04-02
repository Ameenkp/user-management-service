import {AuthenticationService} from "../service/authenticationService";
import {InitiateAuthCommandOutput} from "@aws-sdk/client-cognito-identity-provider";
import {NextFunction, Request, Response} from "express";
import {ConfirmMessage} from "../model/confirmMessage.model";
import {UserManagementServiceConstants} from "../config/userManagementServiceConstants";

export class AuthenticationController {
    private authService: AuthenticationService;

    constructor() {
        this.authService = new AuthenticationService();
    }


    public async initAuthMSISDNOTPRequest(req: Request, res: Response, next: NextFunction): Promise<ConfirmMessage> {
        let statusCode:number = 200;
        let body: { message?: { Session: string }; error?: string } = {};
        try {
            // const inputBody = JSON.parse(req.body || "{}");
            const {userPoolId, clientId, msisdn} = req.body;
            const authResponse: InitiateAuthCommandOutput = await AuthenticationService.initAuth(userPoolId , msisdn, clientId);
            switch (authResponse.$metadata.httpStatusCode) {
                case 200:
                    statusCode = 200;
                    body = {message: {Session: authResponse.Session || ""}};
                    break;
                case 400:
                    statusCode = 400;
                    body = {error: "BadInput"};
                    break;
                case 404:
                    statusCode = 404;
                    body = {error: "ProfileNotFound"};

                    break;
                case 500:
                    statusCode = 500;
                    body = {error: "SomethingIsWrong"};
                    break;
            }
        } catch (error) {
            console.log(error);
            statusCode = 500;
            body = {error: "InternalError"};
        }

        return {
            statusCode,
            body: JSON.stringify(body),
        };
    }

    public async initAuthMSISDNOTPVerify(req: Request, res: Response, next: NextFunction): Promise<ConfirmMessage> {
        let statusCode:number = 200;
        let body =  {};
        const { msisdn, otp, session } = req.body;
        const authResponse = await AuthenticationService.verifier( session, msisdn, otp );
        if(authResponse.error) {
            switch (authResponse.error) {
                case 400:
                    statusCode = 400;
                    body = { message: "BadInput" };
                    break;
                case 500:
                    statusCode = 500;
                    body = { message: "SomethingIsWrong" };
            }
        } else {
            statusCode = 200;
            body = { message: authResponse.message };
        }
        return {
            statusCode,
            body: JSON.stringify(body),
        };
    }


    public async refreshToken (req: Request, res: Response, next: NextFunction) : Promise<any> {
        let statusCode = 200;
        let body = {};
        try {
            const inputBody = JSON.parse(req.body);
            const {error, message} = await AuthenticationService.refreshAuthToken(inputBody.refreshToken, UserManagementServiceConstants.CLIENT_ID);
            if (error) {
                switch (error) {
                    case "?":
                        statusCode = 500;
                        body = { message: error };
                        break;
                    default:
                        statusCode = 500;
                        body = { message: error };
                        break;
                }
            } else {
                statusCode = 200;
                body = { message };
            }
        } catch (err) {
            console.log("*_error:", err);
            statusCode = 500;
            body = { message: "SomethingIsWrong" };
        }
        return {
            statusCode,
            body: JSON.stringify(body)
        };
    };
}