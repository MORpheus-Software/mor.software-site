import { google } from "googleapis";

const SCOPES = ["https://www.googleapis.com/auth/spreadsheets"];

const authenticateGoogle = async () => {
  const keyFile = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  if (!keyFile) {
    throw new Error("Missing GOOGLE_SERVICE_ACCOUNT_JSON environment variable");
  }
  const credentials = JSON.parse(keyFile);

  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: SCOPES,
  });

  return auth.getClient();
};

const googleSheets = google.sheets("v4");

export const appendToSheet = async (rowData: any, sheetName: string = "ProofOfContributions") => {
  const authClient = await authenticateGoogle();

  const spreadsheetId = "1dz14KBusTpaa14UqT7WrT-OZAfqfxgrl8IPNg95g1lo";
  const range = `${sheetName}!A:I`; // Use the provided sheet name

  await googleSheets.spreadsheets.values.append({
    //@ts-ignore
    auth: authClient,
    spreadsheetId,
    range,
    valueInputOption: "RAW",
    resource: {
      values: [rowData],
    },
  });
};
