import nodemailer from 'nodemailer'
import dotenv from 'dotenv';
dotenv.config({ path: '.env' });

const emailRegistro = async (datos) => {
    const transport = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD
        }
    });

    const {email, nombre, token} = datos;
    
    // Enviar el email
    await transport.sendMail({
        from: 'BienesRaices.com',
        to: email,
        subject: 'Confirma tu cuenta en BienesRaices.com',
        text: 'Confirma tu cuenta en BienesRaices.com',
        html: `
            <p> Hola ${nombre}, comprueba tu cuenta en BienesRaices.com</p>

            <p> Tu cuenta ya esta lista, solo debes confirmarla en el siguiete enlace: <a href="${process.env.BACKEND_URL}:${process.env.PORT ?? 3000}/auth/confirmar/${token}">Confirmar cuenta</a></p>
            
            <p>Si no creaste esta cuenta puedes ignorar este mensaje</p>
        `
    })
}


// Email de recuperacion
const emailRecuperacion = async (datos) => {
    const transport = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD
        }
    });

    const { email, nombre, token } = datos;

    // Enviar el email
    await transport.sendMail({
        from: 'BienesRaices.com',
        to: email,
        subject: 'Reestablece tu password en BienesRaices.com',
        text: 'Reestablece tu password en BienesRaices.com',
        html: `
            <p> Hola ${nombre}, has solicitado reestablecer tu password en BienesRaices.com</p>

            <p> Sigue el siguiente enlace para: <a href="${process.env.BACKEND_URL}:${process.env.PORT ?? 3000}/auth/olvide-password/${token}">Reestablecer tu cuenta</a></p>
            
            <p>Sin no solicitaste el cambio de password puedes ignorar este mensaje</p>
        `
    })
}

export {
    emailRegistro,
    emailRecuperacion
}