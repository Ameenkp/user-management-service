import {createClientForDefaultRegion} from "../util/awsSdkUtil";
import {
    AdminGetUserCommand,
    AuthFlowType,
    CognitoIdentityProviderClient,
    ConfirmSignUpCommand,
    InitiateAuthCommand,
    InitiateAuthCommandOutput,
    ResendConfirmationCodeCommand,
    SignUpCommand
} from "@aws-sdk/client-cognito-identity-provider";
import {UserStatusType} from "@aws-sdk/client-cognito-identity-provider/dist-types/models";
import ProfileService from "./profileService";


export class PhoneSignupService {

    private clientCognitoProvider: CognitoIdentityProviderClient = createClientForDefaultRegion(CognitoIdentityProviderClient);

    public async signUp(signUpAppClientId:string, phoneSignupChallengeAppClientId:string, userPoolId:string, msisdn:string, password:string)  {
        const { error } = await this.pureSignUp(phoneSignupChallengeAppClientId, msisdn, password );
        if (error && error === "UsernameExistsException") {
            const { error: getUserError, message: user } = await this.getUser(userPoolId, msisdn );
            if (getUserError) return { error: getUserError };
            switch (user.UserStatus) {
                case UserStatusType.UNCONFIRMED: {
                    const { error: resendError } = await this.resendConfirmationCode( signUpAppClientId, msisdn );
                    if (resendError) return { error: resendError };
                    return { message: { hasProfile: false, status: user.UserStatus } };
                }
                case UserStatusType.CONFIRMED:
                    const { error, message } = await this.initAuth(signUpAppClientId, msisdn );
                    if (error) return { error };
                    const { error: profileError } = await ProfileService.checkIfProfileAlreadyExistWithUserId(user.Username as string);
                    if (profileError && profileError !== "ProfileNotFound") return { error: profileError };
                    else if (profileError === "ProfileNotFound") {
                        return { message: { hasProfile: false, status: user.UserStatus, session: message?.Session } };
                    } else {
                        return { message: { hasProfile: true, status: user.UserStatus, session: message?.Session } };
                    }
                case UserStatusType.ARCHIVED:
                case UserStatusType.COMPROMISED:
                case UserStatusType.UNKNOWN:
                case UserStatusType.RESET_REQUIRED:
                case UserStatusType.FORCE_CHANGE_PASSWORD:
                    return { message: { status: user.UserStatus } };
                default:
                    return { error: "UNKNOWN_USER_STATUS" };
            }
        } else if (error) {
            return { error };
        } else {
            return { message: { hasProfile: false, status: UserStatusType.UNCONFIRMED } };
        }
    };

    private async initAuth(clientId :string,msisdn:string )  {
        const command:InitiateAuthCommand = new InitiateAuthCommand({
            AuthFlow: AuthFlowType.CUSTOM_AUTH,
            ClientId: clientId,
            AuthParameters: {
                USERNAME: msisdn,
            },
        });
        try {
            let result:InitiateAuthCommandOutput = await this.clientCognitoProvider.send(command);
            return { message: result };
        } catch (err :any) {
            console.log("*_initAuth:", err);
            return { error: "InvestigateTheReason" };
        }
    };


    private async pureSignUp (clientId: string, username:string, password :string){

        const command:SignUpCommand = new SignUpCommand({
            ClientId: clientId,
            Username: username,
            Password: password
        });
        try {
            await this.clientCognitoProvider.send(command);
            return { message: true };
        } catch (error:any) {
            console.log("*_pureSignUp:error:", error);
            return { error: error["__type"] };
        }
    };

    private async getUser ( userPoolId:string, username:string ):Promise<any> {
        const client = createClientForDefaultRegion(CognitoIdentityProviderClient);
        const command:AdminGetUserCommand = new AdminGetUserCommand({
            UserPoolId: userPoolId,
            Username: username
        });

        try {
            const response = await this.clientCognitoProvider.send(command);
            return { message: response };
        } catch (error:any) {
            console.log("*_getUser:error:", error);
            return { error: error["__type"] };
        }
    };

    private async resendConfirmationCode (signUpAppClientId:string, username:string){

        const command :ResendConfirmationCodeCommand= new ResendConfirmationCodeCommand({
            ClientId: signUpAppClientId,
            Username: username
        });

        try {
            await this.clientCognitoProvider.send(command);
            return { message: true };
        } catch (error:any) {
            console.log("*_resendConfirmationCode:error:", error);
            return { error: error["__type"] };
        }
    };

    private async confirmSignUp (phoneSignupChallengeAppClientId, signUpAppClientId, username, code ) {
        const command:ConfirmSignUpCommand = new ConfirmSignUpCommand({
            ClientId: signUpAppClientId,
            Username: username,
            ConfirmationCode: code,
        });

        try {
            console.log(100, signUpAppClientId, username, code, command);
            const response = await this.clientCognitoProvider.send(command);
            console.log(666, response);
            const authResponse = await adminAuth({ phoneSignupChallengeAppClientId, msisdn: username });
            console.log(667, authResponse);
            return { message: authResponse["AuthenticationResult"] };
        } catch (error:any) {
            console.log("*_confirmSignUp:error:", error);
            return { error: error["__type"] };
        }
    };


}