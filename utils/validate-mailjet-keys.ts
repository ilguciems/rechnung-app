import Mailjet from "node-mailjet";

export async function validateMailjetKeys(
  publicKey: string,
  privateKey: string,
  fromEmail?: string,
): Promise<{ valid: boolean; error?: string }> {
  try {
    console.log("Validating Mailjet keys...");
    const mailjet = Mailjet.apiConnect(publicKey, privateKey);

    // Simple GET request to validate credentials
    const result = await mailjet.get("contact").request();
    console.log("Mailjet validation successful:", result.response?.status);

    // If fromEmail is provided, validate it's registered in Mailjet
    if (fromEmail) {
      console.log("Validating sender email:", fromEmail);
      try {
        const senderResult = await mailjet.get("sender").request();
        const responseBody = senderResult.body as { Data?: Array<{
          Email: string;
          Status: string;
        }> };
        const senders = responseBody.Data || [];

        console.log("Available senders:", senders);

        const sender = senders.find(
          (s) => s.Email.toLowerCase() === fromEmail.toLowerCase(),
        );

        if (!sender) {
          return {
            valid: false,
            error: `Die E-Mail-Adresse "${fromEmail}" ist nicht in Mailjet registriert. Bitte registrieren Sie diese Adresse zuerst in Ihrem Mailjet-Konto.`,
          };
        }

        if (sender.Status !== "Active") {
          return {
            valid: false,
            error: `Die E-Mail-Adresse "${fromEmail}" ist nicht aktiv (Status: ${sender.Status}). Bitte verifizieren Sie diese Adresse in Ihrem Mailjet-Konto.`,
          };
        }

        console.log("Sender email validated successfully");
      } catch (senderError) {
        console.error("Sender validation error:", senderError);
        return {
          valid: false,
          error:
            "Fehler bei der Validierung der Absender-E-Mail-Adresse. Bitte überprüfen Sie, ob die E-Mail-Adresse in Mailjet registriert ist.",
        };
      }
    }

    return { valid: true };
  } catch (error: unknown) {
    console.error("Mailjet validation error details:", {
      error,
      type: typeof error,
      keys: Object.keys(error || {}),
    });

    if (error && typeof error === "object") {
      // Check for statusCode
      if ("statusCode" in error) {
        const statusCode = (error as { statusCode: number }).statusCode;
        console.error("Status code:", statusCode);
        if (statusCode === 401 || statusCode === 403) {
          return {
            valid: false,
            error:
              "Ungültige API-Schlüssel. Bitte überprüfen Sie Ihre Eingaben.",
          };
        }
      }

      // Check for response body with error message
      if ("response" in error) {
        const response = error.response as {
          body?: { ErrorMessage?: string; Message?: string };
        };
        console.error("Response body:", response.body);
        if (response.body?.ErrorMessage) {
          return {
            valid: false,
            error: response.body.ErrorMessage,
          };
        }
        if (response.body?.Message) {
          return {
            valid: false,
            error: response.body.Message,
          };
        }
      }

      // Check for message property
      if ("message" in error) {
        console.error("Error message:", (error as { message: string }).message);
      }
    }

    return {
      valid: false,
      error: "Fehler bei der Validierung der API-Schlüssel.",
    };
  }
}
