export class UserManagementServiceConstants {
    public static readonly USER_MANAGEMENT_SERVICE_NAME: string = "User Management Service";
    public static readonly USER_MANAGEMENT_SERVICE_PORT: number = 3000;
    public static readonly USER_MANAGEMENT_SERVICE_HOST: string = "localhost";

    public static readonly USER_MANAGEMENT_SERVICE_DEFAULT_REGION: string = process.env.defaultRegion as string;
    public static readonly USER_MANAGEMENT_SERVICE_COGNITO_REGION: string = process.env.cognitoRegion as string;
    public static readonly USER_MANAGEMENT_SERVICE_SIGNUP_APP_CLIENT_ID:string = process.env.SignUpAppClientId as string;
    public static readonly PHONE_SIGNUP_CHALLENGE_APP_CLIENT_ID: string = process.env.PhoneSigupChallengeAppClientId as string;

    public static readonly USER_MANAGEMENT_SERVICE_PATH: string = "/";

    public static readonly USER_MANAGEMENT_SERVICE_PROTOCOL: string = "http";

    public static readonly USER_MANAGEMENT_SERVICE_CORS_ORIGIN: string = "*";
    public static readonly USER_MANAGEMENT_SERVICE_CORS_METHODS: string[] = ["GET", "POST"];
    public static readonly USER_MANAGEMENT_SERVICE_CORS_HEADERS: string[] = ["Content-Type", "Authorization"];
    public static readonly USER_MANAGEMENT_SERVICE_CORS_CREDENTIALS: boolean = true;
    public static readonly USER_MANAGEMENT_SERVICE_CORS_MAX_AGE: number = 600;

    public static readonly USER_MANAGEMENT_SERVICE_ACCOUNT_MSISDN_URL_PREFIX: string = "/account";
    public static readonly USER_MANAGEMENT_SERVICE_ACCOUNT_MSISDN_OTP_URL_PART: string = "msisdn/otp";
    public static readonly USER_MANAGEMENT_SERVICE_ACCOUNT_MSISDN_OTP_REQUEST_URL_PART: string = "/auth/msisdn/otp/request";
    public static readonly USER_MANAGEMENT_SERVICE_ACCOUNT_MSISDN_OTP_VERIFY_URL_PART: string = "/auth/msisdn/otp/verify";
    public static readonly USER_MANAGEMENT_SERVICE_ACCOUNT_TOKEN_REFRESH: string = "/auth/refresh";

    public static readonly USER_MANAGEMENT_SERVICE_ACCOUNT_PHONE_SIGNUP_URL_PART: string = "/signup/phone";
    public static readonly USER_MANAGEMENT_SERVICE_ACCOUNT_PHONE_VERIFY_SIGNUP_URL_PART: string = "/signup/phone/verify";

    public static readonly USER_MANAGEMENT_SERVICE_ACCOUNT_EMAIL_SIGNUP_URL_PART: string = "/signup/email";
    public static readonly USER_MANAGEMENT_SERVICE_ACCOUNTEMAIL_VERIFY_SIGNUP_URL_PART: string = "/signup/email/verify";


    public static USER_POOL_ID = process.env.USER_POOL_ID as string;
    public static USER_CLIENT_ID = process.env.USER_CLIENT_ID;
    public static CLIENT_ID = process.env.CLIENT_ID as string;
    public static IDENTITY_POOL_ID = process.env.IDENTITY_POOL_ID;

}