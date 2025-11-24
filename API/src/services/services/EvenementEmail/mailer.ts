import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
    host: process.env.MAILTRAP_HOST,
    port: Number(process.env.MAILTRAP_PORT) || 2525,
    auth: {
        user: process.env.MAILTRAP_USER,
        pass: process.env.MAILTRAP_PASS,
    },
});

export async function sendMail({
                                   subject,
                                   html,
                                   bcc,
                               }: {
    subject: string;
    html: string;
    bcc: string;
}) {
    try {
        const info = await transporter.sendMail({
            from: '"DRIVN COOK" <no-reply@drivncook.fr>',
            to: "test@mailtrap.io",
            bcc,
            subject,
            html,
        });

        console.log("Email envoyé (Mailtrap):", info.messageId);
    } catch (err) {
        console.error("Erreur envoi email:", err);
        throw err;
    }
}
