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

// Function to validate email format and SMTP connection
async function validateEmail(email) {
  // Basic format check
  if (!/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email)) {
    console.error("Invalid email format:", email);
    return false;
  }
  try {
    // Send a test email to the provided address (replace with a dummy address)
    const info = await sender.sendMail({
      from: EMAIL_LOGIN,
      to: email,
      subject: "SECO - RCR: Check your email address",
      text: "This is a test email to validate your address.",
    });

    console.log("Email sent successfully:", info.messageId);
    return true;
  } catch (error) {
    console.error("Error sending email:", error);
    // Check if the error indicates invalid email or server issue
    if (
      error.code === "ENOTFOUND" ||
      (error.response && error.response.code === 554)
    ) {
      console.error("Invalid email or server issue:", email);
      return false;
    } else {
      // Handle other errors differently
      console.error("Unexpected error:", error);
      return false;
    }
  }
}

module.exports = { sendEmail, validateEmail };
