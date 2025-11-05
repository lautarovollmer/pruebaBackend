import nodemailer from 'nodemailer';

export async function createTestTransporter() {
  const account = await nodemailer.createTestAccount();

  const transporter = nodemailer.createTransport({
    host: account.smtp.host,
    port: account.smtp.port,
    secure: account.smtp.secure,
    auth: {
      user: account.user,
      pass: account.pass,
    },
  });

  return { transporter, testAccount: account };
}

export async function sendTokenMail(to: string, token: string) {
  const { transporter } = await createTestTransporter();
  const info = await transporter.sendMail({
    from: '"Billetera" <no-reply@billetera.local>',
    to,
    subject: 'Token de confirmación',
    text: `Tu token de confirmación es: ${token}`,
    html: `<p>Tu token de confirmación es: <b>${token}</b></p>`,
  });

  return nodemailer.getTestMessageUrl(info);
}
