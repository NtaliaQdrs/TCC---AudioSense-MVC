// Configuração do nodemailer para envio de emails
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

export const enviarEmail = async (destinatario, assunto, corpo) => {
  try {
    await transporter.sendMail({
      from: `"AudioSense" <${process.env.EMAIL_USER}>`,
      to: destinatario,
      subject: assunto,
      html: corpo
    });
    console.log(`Email enviado para ${destinatario}`);
  } catch (err) {
    console.error('Erro ao enviar email:', err);
  }
};

export default transporter;