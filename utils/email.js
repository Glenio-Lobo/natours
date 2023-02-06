import nodemailer from 'nodemailer';

export default async function sendEmail(options){
    // 1) Cria um transportador ( Server para transportar o Email )
    // Foi usado NODEMAILER para testar o serviço de email.
    const transporter = nodemailer.createTransport({
        // service: 'Gmail' -> Serviço pré configurado no nodemailer para o gmail.
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD
        }
        // tls: {
        //     // do not fail on invalid certs
        //     rejectUnauthorized: false
        // }
        // Com gmail precisa ativar a opção "less secure app"
    });

    // 2) Defina as opções do email
    const mailOptions = {
        from: 'Natours Test Development <natourstest@dev.io>',
        to: options.email,
        subject: options.subject,
        text: options.message
    };

    // 3) Envia o email
    await transporter.sendMail(mailOptions);
};