import { google } from "googleapis";
import { prisma } from "@/lib/prisma";

export async function getFreshAccessToken(userId: string) {
  const account = await prisma.account.findFirst({
    where: { userId, provider: "google" },
  });

  if (!account || !account.refresh_token) {
    throw new Error("No Google account found or refresh token missing");
  }

  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET
  );

  oauth2Client.setCredentials({
    access_token: account.access_token,
    refresh_token: account.refresh_token,
    expiry_date: account.expires_at ? account.expires_at * 1000 : undefined,
  });

  try {
    const { token } = await oauth2Client.getAccessToken();
    
    if (token && token !== account.access_token) {
      await prisma.account.update({
        where: { id: account.id },
        data: {
          access_token: token,
          expires_at: Math.floor((oauth2Client.credentials.expiry_date || 0) / 1000),
        },
      });
      return token;
    }
    return account.access_token || "";
  } catch (err) {
    console.error("Error refreshing token:", err);
    throw new Error("Failed to refresh Google access token");
  }
}
