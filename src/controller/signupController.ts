import {v4 as uuidv4} from 'uuid';
import {PhoneSignupService} from "../service/phoneSignupService";
import {NextFunction, Request, Response} from "express";
import {UserManagementServiceConstants} from "../config/userManagementServiceConstants";
import {EmailSignupService} from "../service/emailSignupService";

export class SignupController {

    private phoneSignUpService:PhoneSignupService = new PhoneSignupService();
    private emailSignupService:EmailSignupService = new EmailSignupService();


    ////////////////////////////////////////////////
    // Phone Sign Up
    public async phoneSignUpHandler(req:Request , res:Response , next:NextFunction) {
        let statusCode = 200;
        let body = {};
        const inputBody = JSON.parse(req.body);
        const {msisdn} = inputBody;
        try {
            const {error, message} = await this.phoneSignUpService.signUp(
                UserManagementServiceConstants.USER_MANAGEMENT_SERVICE_SIGNUP_APP_CLIENT_ID,
                UserManagementServiceConstants.PHONE_SIGNUP_CHALLENGE_APP_CLIENT_ID,
                UserManagementServiceConstants.USER_POOL_ID,
                msisdn,
                "Ss@" + uuidv4());
            if (error) {
                switch (error) {
                    case "InvalidParameterException":
                        statusCode = 400;
                        body = {message: error};
                        break;
                    case "UsernameExistsException":
                        statusCode = 409;
                        body = {message: error};
                        break;
                    case "LimitExceededException":
                        statusCode = 400;
                        body = {message: error};
                        break;
                    default:
                        statusCode = 500;
                        body = {message: error};
                }
            } else {
                body = {message};
            }
        } catch (err) {
            console.log("*_error:", err);
            statusCode = 500;
            body = {message: "SomethingIsWrong2"};
        }
        return res.status(statusCode).json(body);
    }


    public async phoneSignupVerifyHandler(req: Request, res: Response, next: NextFunction){
        let statusCode = 200;
        let body = {};
        const inputBody = JSON.parse(req.body);
        const { msisdn, otp } = inputBody;
        try {
            const { error, message } = await this.phoneSignUpService.confirmSignUp( UserManagementServiceConstants.PHONE_SIGNUP_CHALLENGE_APP_CLIENT_ID, UserManagementServiceConstants.USER_MANAGEMENT_SERVICE_SIGNUP_APP_CLIENT_ID, msisdn, otp );
            if (error) {
                switch (error) {
                    case "ExpiredCodeException":
                        statusCode = 400;
                        body = { message: error };
                        break;
                    case "CodeMismatchException":
                        statusCode = 400;
                        body = { message: error };
                        break;
                    default:
                        statusCode = 500;
                        body = { message: "SomethingIsWrong1" };
                        break;
                }
            } else {
                body = { message };
            }
        } catch (err:any) {
            console.log("*_verify:", err);
            switch (err['$metadata'].httpStatusCode) {
                case 400:
                    statusCode = 400;
                    body = { message: err["__type"] };
                    break;
                case 500:
                    statusCode = 500;
                    body = { message: "SomethingIsWrong2" };
                    break;
            }
        }
        return {
            statusCode,
            body: JSON.stringify(body),
        };
    };


    ////////////////////////////////////////////////
    // Email Sign Up

    private async emailSignupHandler (req:Request , res:Response , next:NextFunction) {
        let statusCode:number = 200;
        let body = {};
        const inputBody = JSON.parse(req.body);
        const { email, otp } = inputBody;
        try {
            await this.emailSignupService.confirmSignUp(UserManagementServiceConstants.CLIENT_ID, email, otp );
            statusCode = 200;
            body = {};
        } catch(err:any) {
            console.log("*_verify:", err);
            switch(err['$metadata'].httpStatusCode) {
                case 400:
                    statusCode = 400;
                    body = {message: err["__type"]};
                    break;
                case 500:
                    statusCode = 500;
                    body = {message: "SomethingIsWrong"};
                    break;
            }
        }
        return {
            statusCode,
            body: JSON.stringify(body),
        };
    };
}