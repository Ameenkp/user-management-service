export class UserManagementServiceConstants {
    public static readonly USER_MANAGEMENT_SERVICE_NAME: string = "User Management Service";
    public static readonly USER_MANAGEMENT_SERVICE_PORT: number = 3000;
    public static readonly USER_MANAGEMENT_SERVICE_HOST: string = "localhost";
    public static readonly USER_MANAGEMENT_SERVICE_DEFAULT_REGION: string = process.env.defaultRegion as string;
    public static readonly USER_MANAGEMENT_SERVICE_PATH: string = "/";
    public static readonly USER_MANAGEMENT_SERVICE_PROTOCOL: string = "http";
    public static readonly USER_MANAGEMENT_SERVICE_CORS_ORIGIN: string = "*";
    public static readonly USER_MANAGEMENT_SERVICE_CORS_METHODS: string[] = ["GET", "POST"];
    public static readonly USER_MANAGEMENT_SERVICE_CORS_HEADERS: string[] = ["Content-Type", "Authorization"];
    public static readonly USER_MANAGEMENT_SERVICE_CORS_CREDENTIALS: boolean = true;
    public static readonly USER_MANAGEMENT_SERVICE_CORS_MAX_AGE: number = 600;
    public static readonly USER_MANAGEMENT_SERVICE_ACCOUNT_MSISDN_URL_PREFIX: string = "/account/auth";
    public static readonly USER_MANAGEMENT_SERVICE_ACCOUNT_MSISDN_OTP_URL_PART: string = "msisdn/otp";
    public static readonly USER_MANAGEMENT_SERVICE_ACCOUNT_MSISDN_OTP_REQEUST_URL_PART: string = "/msisdn/otp/request";
    public static readonly USER_MANAGEMENT_SERVICE_ACCOUNT_MSISDN_OTP_VERIFY_URL_PART: string = "/msisdn/otp/verify";

}