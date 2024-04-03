import {
    AuthFlowType,
    CognitoIdentityProviderClient,
    RespondToAuthChallengeCommand,
    InitiateAuthCommand, InitiateAuthCommandOutput,
    ListUsersCommand, ListUsersCommandOutput,
} from "@aws-sdk/client-cognito-identity-provider";
import {createClientForDefaultRegion, createClientForRegion} from "../config/awsSdkUtil";
import {
    DynamoDBClient,
} from "@aws-sdk/client-dynamodb";
import {
    DynamoDBDocumentClient, GetCommand,
} from "@aws-sdk/lib-dynamodb";
import {GetCommandOutput} from "@aws-sdk/lib-dynamodb/dist-types/commands";

import {
    CognitoIdentityClient
} from "@aws-sdk/client-cognito-identity";

import { fromCognitoIdentityPool } from "@aws-sdk/credential-provider-cognito-identity";
import {UserManagementServiceConstants} from "../config/userManagementServiceConstants";
import {CognitoIdentityCredentials} from "@aws-sdk/credential-provider-cognito-identity/dist-types/fromCognitoIdentity";
import {AuthenticationResultType} from "@aws-sdk/client-cognito-identity-provider/dist-types/models/models_0";
import {UserStatusType} from "@aws-sdk/client-cognito-identity-provider/dist-types/models";
import ProfileService from "./profileService";


export class AuthenticationService {
    private static clientCognitoProvider: CognitoIdentityProviderClient = createClientForDefaultRegion(CognitoIdentityProviderClient);
    private static readonly clientCognitoIdentity: CognitoIdentityClient = createClientForDefaultRegion(CognitoIdentityClient);
    private static readonly dynamoClient: DynamoDBClient = new DynamoDBClient(createClientForDefaultRegion);
    private static readonly cognitoIdentity = createClientForRegion(UserManagementServiceConstants.USER_MANAGEMENT_SERVICE_COGNITO_REGION, CognitoIdentityProviderClient);

    private static dynamo: DynamoDBDocumentClient = DynamoDBDocumentClient.from(this.dynamoClient, {
        marshallOptions: {
            removeUndefinedValues: true,
        },
    })

    constructor() {
    }

    /////////////////////////////////////////////////
    ///MSISDN OTP REQUEST///////


    public static async initAuth( userPoolId: string, clientId: string, msisdn: string )    {

        const { error, message } = await ProfileService.checkIfProfileAlreadyExist(userPoolId, msisdn);
        console.log(666, error, message)
        if (error) return { "$metadata": { httpStatusCode: 404 } };
        const command = new InitiateAuthCommand({
            AuthFlow: AuthFlowType.CUSTOM_AUTH,
            ClientId: clientId,
            AuthParameters: {
                USERNAME: message?.userId,
            },
        });

        try {
            let result:InitiateAuthCommandOutput = await this.clientCognitoProvider.send(command);
            return result;
        } catch (err:any) {
            console.log("*_initAuth:", err);
            return {
                "$metadata": { httpStatusCode: err["$metadata"].httpStatusCode }
            };
        }
    }

    /////////////////////////////////////////////////
    ///MSISDN OTP VERIFY///////

    public static async verifier(session: string, msisdn: string, otp: string): Promise<{ message?: any, error?: number }> {
        try {
            const command = new RespondToAuthChallengeCommand({
                ChallengeName: 'CUSTOM_CHALLENGE',
                ClientId: UserManagementServiceConstants.USER_CLIENT_ID,
                Session: session,
                ChallengeResponses: {
                    USERNAME: msisdn,
                    ANSWER: otp,
                },
            });
            const authResp:InitiateAuthCommandOutput = await this.clientCognitoProvider.send(command);
            try {
                const credentialsResp = await this.getCredentials((<AuthenticationResultType>authResp.AuthenticationResult).IdToken as string);
                return { message: { ...authResp.AuthenticationResult, ...credentialsResp.message } };
            } catch (err:any) {
                return { error: err };
            }
        } catch (err :any) {
            console.log("*_initAuth:", err);
            return { error: (err).$metadata?.httpStatusCode ?? 500 };
        }
    }

    private static async getCredentials(idToken: string): Promise<{ message?: any, error?: number }> {
        let Logins: { [key: string]: string } = {};
        Logins[`cognito-idp.${UserManagementServiceConstants.USER_MANAGEMENT_SERVICE_DEFAULT_REGION}
            .amazonaws.com/${UserManagementServiceConstants.USER_POOL_ID}`] = idToken;
        try {
            const resp:CognitoIdentityCredentials = await fromCognitoIdentityPool({
                client: this.clientCognitoIdentity,
                identityPoolId: <string>UserManagementServiceConstants.IDENTITY_POOL_ID,
                logins: Logins
            })();
            console.log(666, resp);
            return { message: resp };
        } catch (err:any) {
            console.log(err);
            return { error: 500 };
        }
    }


    /////////////////////////////////////////////////
    ///TOKEN REFRESH///////
    public static async refreshAuthToken(refreshToken:string, clientId:string) {
        const refreshParams = new InitiateAuthCommand({
            AuthFlow: AuthFlowType.REFRESH_TOKEN_AUTH,
            ClientId: clientId,
            AuthParameters: {
                REFRESH_TOKEN: refreshToken,
            },
        });

        try {
            const refreshResponse = await this.cognitoIdentity.send(refreshParams);
            console.log("Token refresh successful");
            console.log("Access Token: ", refreshResponse.AuthenticationResult.AccessToken);
            console.log("ID Token: ", refreshResponse.AuthenticationResult.IdToken);
            return { message: refreshResponse.AuthenticationResult };
        } catch (error) {
            console.error("Error during token refresh: ", error);
            return { error: "SomethingIsWrong" };
        }
    }
}