import Mailjet from "node-mailjet";

type SendEmailProps = {
  to: string;
  subject: string;
  text: string;
};

export async function sendAuthorizationEmail({
  to,
  subject,
  text,
}: SendEmailProps) {
  const apiKey = process.env.MAILJET_API_KEY;
  const apiSecret = process.env.MAILJET_API_SECRET;
  const emailFrom = process.env.EMAIL_FROM;

  if (!apiKey || !apiSecret || !emailFrom) {
    console.error("Mailjet configuration is missing in environment variables!");
    throw new Error("Email service is misconfigured.");
  }

  const mailjet = Mailjet.apiConnect(apiKey, apiSecret);

  try {
    const response = await mailjet.post("send", { version: "v3.1" }).request({
      Messages: [
        {
          From: {
            Email: emailFrom,
            Name: "Grüße von der Rechnung-App",
          },
          To: [
            {
              Email: to,
              Name: "User",
            },
          ],
          Subject: subject,
          TextPart: text,
        },
      ],
    });
    return response.body;
  } catch (error) {
    console.error("Error sending email with Mailjet:", error);
    throw new Error("Failed to send email.");
  }
}
