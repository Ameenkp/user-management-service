import {CognitoIdentityProviderClient, ConfirmSignUpCommand} from "@aws-sdk/client-cognito-identity-provider";
import {createClientForDefaultRegion} from "../config/awsSdkUtil";


export class EmailSignupService {

    private clientCognitoProvider: CognitoIdentityProviderClient = createClientForDefaultRegion(CognitoIdentityProviderClient);


    public async confirmSignUp (clientId:string, username:string, code:string ) {
        const client = createClientForDefaultRegion(CognitoIdentityProviderClient);
        const command:ConfirmSignUpCommand = new ConfirmSignUpCommand({
            ClientId: clientId,
            Username: username,
            ConfirmationCode: code,
        });

        try {
            await client.send(command);
            return { message: true };
        } catch (error:any) {
            console.log("*_confirmSignUp:error:", error);
            return { error: error["__type"] };
        }
    };
}