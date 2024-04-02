import {v4 as uuidv4} from 'uuid';
import {PhoneSignupService} from "../service/phoneSignupService";
import {NextFunction, Request, Response} from "express";
import {UserManagementServiceConstants} from "../config/userManagementServiceConstants";

export class SignupController {

    private signUpService:PhoneSignupService = new PhoneSignupService();
    public async signUpHandler(req:Request , res:Response , next:NextFunction) {
        let statusCode = 200;
        let body = {};
        const inputBody = JSON.parse(req.body);
        const {msisdn} = inputBody;
        try {
            const {error, message} = await this.signUpService.signUp(
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


    public async signupVerifyHandler (req: Request, res: Response, next: NextFunction){
        let statusCode = 200;
        let body = {};
        const inputBody = JSON.parse(req.body);
        const { msisdn, otp } = inputBody;
        try {
            const { error, message } = await confirmSignUp( UserMangementServiceConstants.PHONE_SIGNUP_CHALLENGE_APP_CLIENT_ID, UserMangementServiceConstants.USER_MANAGEMENT_SERVICE_SIGNUP_APP_CLIENT_ID, msisdn, otp );
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
        } catch (err) {
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
        const response = {
            statusCode,
            body: JSON.stringify(body),
        };
        return response;
    };
}