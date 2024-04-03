import {
    CognitoIdentityProviderClient,
    ConfirmSignUpCommand,
    SignUpCommand
} from "@aws-sdk/client-cognito-identity-provider";
import {createClientForDefaultRegion} from "../config/awsSdkUtil";


export class EmailSignupService {

    private clientCognitoProvider: CognitoIdentityProviderClient = createClientForDefaultRegion(CognitoIdentityProviderClient);

    public async emailSignUp ( clientId:string, username:string, password:string ) {
        const command:SignUpCommand = new SignUpCommand({
            ClientId: clientId,
            Username: username,
            Password: password
        });
        try {
            await this.clientCognitoProvider.send(command);
            return { message: true };
        } catch (error:any) {
            console.log("*_signUp:error:", error);
            return { error: error["__type"] };
        }
    };

    public async confirmEmailSignUp (clientId:string, username:string, code:string ) {
        const command:ConfirmSignUpCommand = new ConfirmSignUpCommand({
            ClientId: clientId,
            Username: username,
            ConfirmationCode: code,
        });
        try {
            await this.clientCognitoProvider.send(command);
            return { message: true };
        } catch (error:any) {
            console.log("*_confirmSignUp:error:", error);
            return { error: error["__type"] };
        }
    };
}