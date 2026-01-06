import Mailjet from "node-mailjet";

const mailjet = Mailjet.apiConnect(
  process.env.MAILJET_API_KEY as string,
  process.env.MAILJET_API_SECRET as string,
);

const emailFrom = process.env.EMAIL_FROM as string;

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
