import {GetCommandOutput} from "@aws-sdk/lib-dynamodb/dist-types/commands";
import {DynamoDBDocumentClient, GetCommand} from "@aws-sdk/lib-dynamodb";
import {
    CognitoIdentityProviderClient,
    ListUsersCommand,
    ListUsersCommandOutput
} from "@aws-sdk/client-cognito-identity-provider";
import {createClientForDefaultRegion} from "../config/awsSdkUtil";
import {DynamoDBClient} from "@aws-sdk/client-dynamodb";
import {UserStatusType} from "@aws-sdk/client-cognito-identity-provider";
export default class ProfileService {

    private static clientCognitoProvider: CognitoIdentityProviderClient = createClientForDefaultRegion(CognitoIdentityProviderClient);
    private static readonly dynamoClient: DynamoDBClient = new DynamoDBClient(createClientForDefaultRegion);
    private static dynamo: DynamoDBDocumentClient = DynamoDBDocumentClient.from(this.dynamoClient, {
        marshallOptions: {
            removeUndefinedValues: true,
        },
    })
     static async checkIfProfileAlreadyExist(userPoolId: string, msisdn: string) {
        const { error, message } = await this.getUserAccount(userPoolId, msisdn);
        if (error && error !== "UserNotFound") return { error };
        else if (error) return { error: "ProfileNotFound" };
        const params = {
            TableName: "profile",
            Key: {
                userId: message?.Username
            },
            ProjectionExpression: "userId"
        };
        try {
            let result:GetCommandOutput = await this.dynamo.send(
                new GetCommand(params)
            );
            console.log("*_8", result);
            if (result.Item) return { message: result.Item };
            else return { error: "ProfileNotFound" };
        } catch (error:any) {
            console.log("*_checkIfProfileAlreadyExist:", error);
            return { error: error["__type"] };
        }
    }

    static async getUserAccount(userPoolId: string, username: string) {
        try {
            let params = {
                UserPoolId: userPoolId,
                Filter: `phone_number = "${username}"`,
                Limit: 2
            };
            const response:ListUsersCommandOutput= await this.clientCognitoProvider.send(new ListUsersCommand(params));
            if (response.Users && response.Users.length > 0) {
                const validToContinueUsers = response.Users.filter(user => user.UserStatus === UserStatusType.CONFIRMED);
                if (validToContinueUsers.length > 0)
                    return { message: validToContinueUsers[0] };

                return { error: "UserExistsButNotAllowedToLogin" };
            } else {
                return { error: "UserNotFound" };
            }
        } catch (error: any) {
            console.log("*_checkIfProfileAlreadyExist:", error);
            return { error: error["__type"] };
        }
    }

    public static async checkIfProfileAlreadyExistWithUserId(userId:string){
        const params = {
            TableName: "profile",
            Key: {
                userId: userId
            },
            ProjectionExpression: "isPrivate, fullName"
        };
        console.log(666, 2, params)
        try {
            let result = await this.dynamo.send(
                new GetCommand(params)
            );
            console.log("*_8", result);
            if (result.Item) return { message: result.Item };
            else return { error: "ProfileNotFound" };
        } catch (error:any) {
            console.log("*_checkIfProfileExist:", error);
            return { error: error["__type"] };
        }
    };

}