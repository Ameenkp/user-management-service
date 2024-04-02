import {Request , Response} from "express";
export interface ConfirmMessage{
    body: string;
    statusCode: number;
}


export interface CustomRequest extends Request{
    session?: any;
    callerContext?: {
        clientId: string;
    };
    userAttributes: {
        phone_number: string
    };
    challengeAnswer: string;
    privateChallengeParameters?:{
        otp: string
    }
}


export interface CustomResponse extends Response{
    privateChallengeParameters?: any;
    publicChallengeParameters?: any;
    issueTokens?: boolean;
    failAuthentication?: boolean;
    challengeName?: string;
    answerCorrect?: boolean;
}