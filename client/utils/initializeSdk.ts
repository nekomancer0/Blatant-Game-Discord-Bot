import { DiscordSDK } from "@discord/embedded-app-sdk";

/**
 * This function should be called from the top-level of your embedded app
 * It initializes the SDK, then authorizes, and authenticates the embedded app
 */
export async function initializeSdk(): Promise<DiscordSDK> {
  if (typeof process.env.CLIENT_ID !== "string") {
    throw new Error("Must specify 'CLIENT_ID");
  }
  const discordSdk = new DiscordSDK(process.env.CLIENT_ID);
  await discordSdk.ready();

  // Pop open the OAuth permission modal and request for access to scopes listed in scope array below
  const { code } = await discordSdk.commands.authorize({
    client_id: process.env.CLIENT_ID,
    response_type: "code",
    state: "",
    prompt: "none",
    scope: [
      "identify",
      "applications.commands",
      "rpc.activities.write",
      "rpc.voice.read",
    ],
  });

  // Retrieve an access_token from your embedded app's server

  const response = await fetch(`https://discord.com/api/oauth2/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: {
      //@ts-ignore
      client_id: process.env.CLIENT_ID,
      client_secret: process.env.CLIENT_SECRET,
      grant_type: "authorization_code",
      redirect_uri: process.env.CALLBACK,
      code,
    },
  });

  // const response = await fetch("/api/token", {
  //   method: "POST",
  //   body: JSON.stringify({
  //     code,
  //     redirect_uri: process.env.CALLBACK,
  //   }),
  //   headers: {
  //     "Content-Type": "application/json",
  //   },
  // });

  const { access_token } = await response.json();

  // Authenticate with Discord client (using the access_token)
  await discordSdk.commands.authenticate({
    access_token,
  });

  return discordSdk;
}
