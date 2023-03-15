import nodemailer from 'nodemailer';
import pug from 'pug';
import { fileURLToPath } from 'url';
import { convert } from 'html-to-text'

const __dirname = fileURLToPath(new URL('../', import.meta.url));

class Email {
    constructor(user, url){
        this.to = user.email;
        this.firstName = user.name.split(' ')[0];
        this.url = url;
        this.from = `${process.env.NODE_ENV === 'production' ? process.env.EMAIL_FROM : process.env.DEV_EMAIL_FROM}`;
    }

    createTransport(){
        if(process.env.NODE_ENV === 'production'){
            return nodemailer.createTransport({
                service: 'SendGrid',
                auth: {
                    user: process.env.SENDGRID_USERNAME,
                    pass: process.env.SENDGRID_PASSWORD
                }
            });
        }else{
            // 1) Cria um transportador ( Server para transportar o Email )
            // Foi usado NODEMAILER para testar o serviço de email.
            return nodemailer.createTransport({
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
        }
    }

    async send(template, subject){
        // Envia os emails
        // 1) Renderiza o HTML do email baseado em um Template do PUG
        console.log(__dirname);
        const html = pug.renderFile(`${__dirname}/views/emails/${template}.pug`, {
            firstName: this.firstName,
            url: this.url,
            subject
        });

        // 2)  Define as opções de email
        const mailOptions = {
            from: this.from,
            to: this.to,
            subject,
            html,
            text: convert(html)
        };
                
        // 3) Create a transport e envia o email
        await this.createTransport().sendMail(mailOptions);
    }

    async sendWelcome(){
        // PUG template name relacionado ao email
        await this.send('welcome', 'Welcome to the natours family!');
    }
    
    async sendPasswordReset(){
        await this.send('passwordReset', 'Your password reset token. ( Valid for 10 minutes )')
    }
}

export default Email