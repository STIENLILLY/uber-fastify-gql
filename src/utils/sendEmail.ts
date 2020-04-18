import nodemailer from 'nodemailer';

const options = {
    host: 'smtp.sendgrid.net',
    port: 465,
    secure: true,
    auth: {
        user: process.env.SENDGRID_USER,
        pass: process.env.SENDGRID_API,
    },
};

const transporter = nodemailer.createTransport(options);

export const sendEmail = async (to: string, code: string): Promise<void> => {
    const message = {
        from: 'no-reply@whatyourna.me',
        to,
        subject: 'Your Verification Code is',
        text: `Your Verificaction Code : ${code}`,
        html: `<p>Your Verificaction Code : <b>${code}</b></p>`,
    };

    await transporter.sendMail(message);
};
