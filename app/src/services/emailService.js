import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
});

const enviarEmail = async (destinatario, assunto, corpo) => {
  try {
    await transporter.sendMail({
      from: `"API de Tarefas" <${process.env.EMAIL_FROM}>`,
      to: destinatario,
      subject: assunto,
      html: corpo,
    });

    console.log(`[EMAIL] E-mail enviado para ${destinatario}`);
  } catch (err) {
    console.error(`[EMAIL] Erro ao enviar e-mail: ${err.message}`);
  }
};

export default enviarEmail;
