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

export const appendToSheet = async (rowData: any) => {
  const authClient = await authenticateGoogle();

  const spreadsheetId = "1-CzYIvlkTJVa35oHbHDk4HX-Ks7d76fa2rmHaphV0ic";
  const range = "Sheet1!A:I";

  googleSheets.spreadsheets.values.append({
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
