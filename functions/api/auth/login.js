import { redirect } from "../../_auth.js";
export async function onRequestGet({request,env}) {
  if(!env.GITHUB_CLIENT_ID||!env.GITHUB_CLIENT_SECRET||!env.SESSION_SECRET||!env.ADMIN_GITHUB_USERNAME) return new Response("Admin authentication is not configured. See README.md.",{status:503});
  const state=Array.from(crypto.getRandomValues(new Uint8Array(24)),b=>b.toString(16).padStart(2,"0")).join("");
  const url=new URL("https://github.com/login/oauth/authorize"); url.searchParams.set("client_id",env.GITHUB_CLIENT_ID); url.searchParams.set("redirect_uri",new URL("/api/auth/callback",request.url).toString()); url.searchParams.set("scope","repo"); url.searchParams.set("state",state);
  return redirect(url.toString(),{"Set-Cookie":`btb_oauth_state=${state}; Path=/api/auth; HttpOnly; Secure; SameSite=Lax; Max-Age=600`});
}
