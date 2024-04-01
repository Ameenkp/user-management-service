import {APIGatewayProxyEvent, APIGatewayProxyResult} from "aws-lambda";
import {AuthenticationService} from "../service/authenticationService";
import {InitiateAuthCommandOutput} from "@aws-sdk/client-cognito-identity-provider";
import {Request , Response, NextFunction} from "express";
import {ConfirmMessage} from "../model/confirmMessage.model";

export class AuthenticationController {
    private authService: AuthenticationService;

    constructor() {
        this.authService = new AuthenticationService();
    }


    public async handleEvent(req: Request, res: Response, next: NextFunction): Promise<ConfirmMessage> {
        let statusCode = 200;
        let body: { message?: { Session: string }; error?: string } = {};
        try {
            const inputBody = JSON.parse(req.body || "{}");
            const {msisdn} = inputBody;
            const authResponse: InitiateAuthCommandOutput = await this.authService.initAuth(msisdn);
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
}

//     public async handleEvent(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
//         let statusCode = 200;
//         let body: { message?: { Session: string }; error?: string } = {};
//         try {
//             const inputBody = JSON.parse(event.body || "{}");
//             const { msisdn } = inputBody;
//             const authResponse:InitiateAuthCommandOutput = await this.authService.initAuth(msisdn);
//             switch (authResponse.$metadata.httpStatusCode) {
//                 case 200:
//                     statusCode = 200;
//                     body = { message: { Session: authResponse.Session || "" } };
//                     break;
//                 case 400:
//                     statusCode = 400;
//                     body = { error: "BadInput" };
//                     break;
//                 case 404:
//                     statusCode = 404;
//                     body = { error: "ProfileNotFound" };
//                     break;
//                 case 500:
//                     statusCode = 500;
//                     body = { error: "SomethingIsWrong" };
//                     break;
//             }
//         } catch (error) {
//             statusCode = 500;
//             body = { error: "InternalError" };
//         }
//
//         return {
//             statusCode,
//             body: JSON.stringify(body),
//         };
//     }
// }