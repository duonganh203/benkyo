import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

export const sendOTPEmail = async (email: string, otp: string) => {
    const mailOptions = {
        from: `"Benkyo team" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: 'One-Time Password (OTP) Verification',
        html: `
      <p>Dear User,</p>
      <p>We received a request to verify your email address. Your one-time password (OTP) is:</p>
      <h2 style="color: #2e86de;">${otp}</h2>
      <p>Please use this code within <b>5 minutes</b> to complete your verification.</p>
      <p>If you did not request this, please ignore this email.</p>
      <p>Thank you,<br/>The Your App Team</p>
    `
    };

    await transporter.sendMail(mailOptions);
};
