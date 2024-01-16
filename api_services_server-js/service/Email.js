const nodemailer = require("nodemailer");

const {
  EMAIL_LOGIN,
  EMAIL_PWD,
  EMAIL_PORT,
  EMAIL_HOST,
  EMAIL_SERVICE,
} = require("../Credentials");

// ! Inicializando o sender
const sender = nodemailer.createTransport({
  service: EMAIL_SERVICE,
  host: EMAIL_HOST,
  port: EMAIL_PORT,
  secure: false,
  auth: {
    user: EMAIL_LOGIN,
    pass: EMAIL_PWD,
  },
});

/**
 * Envia um email para um determinado destinatário com determinado assunto e texto.
 * @param {String} to Email do destinatário.
 * @param {String} subject Assunto do email.
 * @param {String} text Texto do email.
 * @returns {Boolean} Retorna true se o email foi enviado, e false caso contrário.
 *
 * **/
const sendEmail = async (to, subject, text) => {
  try {
    await sender.sendMail({
      from: EMAIL_LOGIN,
      to: to,
      subject: subject,
      html: text,
    });
    return true;
  } catch (error) {
    return false;
  }
};

module.exports = sendEmail;
