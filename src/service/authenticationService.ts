import {
    AuthFlowType,
    CognitoIdentityProviderClient,
    InitiateAuthCommand, InitiateAuthCommandOutput,
    ListUsersCommand, ListUsersCommandOutput,
} from "@aws-sdk/client-cognito-identity-provider";
import { createClientForDefaultRegion } from "../util/awsSdkUtil";
import {
    DynamoDBClient,
} from "@aws-sdk/client-dynamodb";
import {
    DynamoDBDocumentClient, GetCommand,
} from "@aws-sdk/lib-dynamodb";
import {GetCommandOutput} from "@aws-sdk/lib-dynamodb/dist-types/commands";

class AuthenticationService {
    private client: CognitoIdentityProviderClient;
    private readonly dynamoClient: DynamoDBClient;
    private dynamo: DynamoDBDocumentClient;

    constructor() {
        this.client = createClientForDefaultRegion(CognitoIdentityProviderClient);
        this.dynamoClient = new DynamoDBClient(createClientForDefaultRegion);
        this.dynamo = DynamoDBDocumentClient.from(this.dynamoClient, {
            marshallOptions: {
                removeUndefinedValues: true,
            },
        });
    }

    private async getUserAccount(userPoolId: string, username: string) {
        try {
            let params = {
                UserPoolId: userPoolId,
                Filter: `phone_number = "${username}"`,
                Limit: 2
            };
            const response:ListUsersCommandOutput= await this.client.send(new ListUsersCommand(params));
            if (response.Users && response.Users.length > 0) {
                const validToContinueUsers = response.Users.filter(user => user.UserStatus === "CONFIRMED");
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

    private async checkIfProfileAlreadyExist(userPoolId: string, msisdn: string) {

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

    public async initAuth({ userPoolId, clientId, msisdn }: { userPoolId: string, clientId: string, msisdn: string })    {

        const { error, message } = await this.checkIfProfileAlreadyExist(userPoolId, msisdn);
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
            let result:InitiateAuthCommandOutput = await this.client.send(command);
            return result;
        } catch (err:any) {
            console.log("*_initAuth:", err);
            return {
                "$metadata": { httpStatusCode: err["$metadata"].httpStatusCode }
            };
        }
    }
}

export { AuthenticationService };
