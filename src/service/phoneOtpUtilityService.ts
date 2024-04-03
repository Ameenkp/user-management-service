import { SNSClient, PublishCommand } from "@aws-sdk/client-sns";
import { createClientForDefaultRegion } from "../config/awsSdkUtil";
import {NextFunction, Request , Response} from "express";
import {UserManagementServiceConstants} from "../config/userManagementServiceConstants";
import {CustomRequest, CustomResponse} from "../model/confirmMessage.model";
import {OtpChallengeNameEnum} from "../util/enum/otpChallengeNameEnum";



export class PhoneOtpUtilityService {

    private static client: SNSClient = new SNSClient(createClientForDefaultRegion);
    private static  generateOTP() {
        const otp:number = Math.floor(100000 + Math.random() * 900000); // Generate a 6-digit OTP
        return otp.toString();
    }

    private static async sendOTPSMS(phoneNumber: string, otp:string) {
        const command:PublishCommand = new PublishCommand({
            Message: `Your OTP for password less login is: ${otp}`,
            PhoneNumber: phoneNumber
        });
        try {
            await this.client.send(command);
            console.log(`OTP sent successfully to ${phoneNumber}`);
        } catch (error) {
            console.error(`Error sending OTP to ${phoneNumber}:`, error);
            throw error;
        }
    }

    private static async createOtpAuthChallenge(req: CustomRequest, res: CustomResponse, next: NextFunction): Promise<any> {
        try {
            const clientId:string  = req.callerContext?.clientId as string;
            if (clientId === UserManagementServiceConstants.PHONE_SIGNUP_CHALLENGE_APP_CLIENT_ID) {
                res.privateChallengeParameters = { forceLogin: true };
            } else if (!req.session || req.session.length === 0) {
                const phoneNumber = req.userAttributes.phone_number;
                const otp:string = this.generateOTP();
                await this.sendOTPSMS(phoneNumber, otp);
                res.privateChallengeParameters = { otp };
            }
            // Set the challenge metadata and answer keys
            // req.response.challengeMetadata = 'PhoneOTPChallenge';
            // req.response.challengeName = 'PhoneOTPChallenge';
            res.publicChallengeParameters = {};
            return res;
        } catch (error) {
            next(error); // Pass error to Express error handler
        }
    }

    private static async defineOtpAuthChallenge (req: CustomRequest, res: CustomResponse, next: NextFunction)  {
        if (req.session &&
            req.session.length > 0 &&
            req.session[0].challengeResult === true) {
            res.issueTokens = true;
            res.failAuthentication = false;
        } else {

            res.issueTokens = false;
            res.failAuthentication = false;
            res.challengeName = OtpChallengeNameEnum.CUSTOM_CHALLENGE;
        }
        return res;
    };


    private static async verifyOtpAuthChallenge (req: CustomRequest, res: CustomResponse, next: NextFunction){
        const submittedOtp = req.challengeAnswer;
        const expectedOtp = req.privateChallengeParameters?.otp as string;
        // Check if the submitted OTP matches the expected OTP
        if(req.callerContext?.clientId == UserManagementServiceConstants.PHONE_SIGNUP_CHALLENGE_APP_CLIENT_ID) {
            res.answerCorrect = true;
        } else res.answerCorrect = submittedOtp === expectedOtp;

        return res;
    };




}