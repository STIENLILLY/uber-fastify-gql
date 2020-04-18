import Twilio from 'twilio';

const twilioClient = Twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

const sendSMS = (to: string, body: string) => {
    return twilioClient.messages.create({
        to,
        body,
        from: process.env.TWILIO_PHONE,
    });
};

export const sendVerificationSMS = (to: string, key: string) => sendSMS(to, `Your verification key is ${key}`);
