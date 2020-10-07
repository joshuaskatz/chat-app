import nodemailer from "nodemailer";

export const mailToken = async (
  token: string,
  email: string
): Promise<void> => {
  const transporter = nodemailer.createTransport({
    host: "smtp.ethereal.email", //currently set up for ethereal
    port: 587,
    secure: false,
    auth: {
      user: process.env.MAIL_USER, //enter username here
      pass: process.env.MAIL_PASS, //enter password here
    },
  });

  const info = await transporter.sendMail({
    from: '"Fred Foo 👻" <foo@example.com>',
    to: `${email}`,
    subject: "Request Password Reset",
    html: `
        <div>
            <a href='${process.env.FRONTEND_URL}/reset-password/${token}'>Reset Password</a>
            ${token}
        </div>
    `,
  });

  console.log("Message sent: %s", info.messageId);

  console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
};
