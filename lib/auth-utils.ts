import { prisma } from "./prisma";

/**
 * Ensures the user has a valid access token. 
 * If the token in the DB is expired, it uses the refresh token to get a new one.
 */
export async function getValidTokens(userId: string) {
  const account = await prisma.account.findFirst({
    where: { 
      userId,
      provider: "google"
    }
  });

  if (!account) {
    console.error(`[OAuth] No account found in DB for user ${userId}`);
    return null;
  }

  console.log(`[OAuth] Account found. Has RT: ${!!account.refresh_token}, Has AT: ${!!account.access_token}`);

  // If the token is still valid (with 5 min buffer), return it
  if (account.access_token && account.expires_at && Date.now() < (account.expires_at * 1000 - 300000)) {
    console.log(`[OAuth] Access token still valid for user ${userId}`);
    return {
      accessToken: account.access_token,
      refreshToken: account.refresh_token,
    };
  }

  if (account.refresh_token) {
    console.log(`[OAuth] Attempting refresh for user ${userId}...`);
    try {
      const response = await fetch("https://oauth2.googleapis.com/token", {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          client_id: process.env.GOOGLE_CLIENT_ID!,
          client_secret: process.env.GOOGLE_CLIENT_SECRET!,
          grant_type: "refresh_token",
          refresh_token: account.refresh_token,
        }),
        method: "POST",
      });

      const refreshedTokens = await response.json();

      if (!response.ok) throw refreshedTokens;

      // Update the database with the new tokens
      await prisma.account.update({
        where: { id: account.id },
        data: {
          access_token: refreshedTokens.access_token,
          expires_at: Math.floor(Date.now() / 1000 + refreshedTokens.expires_in),
          refresh_token: refreshedTokens.refresh_token ?? account.refresh_token,
        },
      });

      return {
        accessToken: refreshedTokens.access_token,
        refreshToken: refreshedTokens.refresh_token ?? account.refresh_token,
      };
    } catch (error) {
      console.error("Error refreshing access token", error);
      return null;
    }
  }

  return null;
}
