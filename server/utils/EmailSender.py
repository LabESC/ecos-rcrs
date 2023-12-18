
# ! Importando .env
import os
from dotenv import load_dotenv
from pathlib import Path

env_path = Path(".") / ".env"
load_dotenv(dotenv_path=env_path)

email_login = os.getenv("EMAIL_LOGIN")
email_pwd = os.getenv("EMAIL_PWD")
email_host = os.getenv("EMAIL_HOST")
email_port = int(os.getenv("EMAIL_PORT"))
email_sender = email_login

# Importando bibliotecas para o envio de e-mails
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

def send_email(receiver, subject, message):
    print(f"Enviando e-mail para {receiver}, de {email_sender}")
    try:
        # Configuração do e-mail
        email = MIMEMultipart()
        email['From'] = email_sender
        email['To'] = receiver
        email['Subject'] = subject

        message_body = MIMEText(message, 'plain')
        email.attach(message_body)

        # Conexão com o servidor SMTP
        server = smtplib.SMTP(host=email_host, port=email_port)
        server.starttls()  # Habilita a criptografia TLS
        server.login(email_login, email_pwd)

        # Envio do e-mail
        server.sendmail(email_sender, receiver, email.as_string())

        # Encerramento da conexão
        server.quit()
        return True

    except Exception as e:
        print(f"Ocorreu um erro ao enviar o e-mail: {e}")
        return False
