import { makeSession, sessionCookie, redirect } from "../../_auth.js";
export async function onRequestGet({request,env}) {
  const u=new URL(request.url), code=u.searchParams.get("code"), state=u.searchParams.get("state");
  const saved=(request.headers.get("Cookie")||"").split(";").map(x=>x.trim()).find(x=>x.startsWith("btb_oauth_state="))?.split("=")[1];
  if(!code||!state||!saved||state!==saved) return new Response("Authentication could not be verified. Please try again.",{status:400});
  const tokenRes=await fetch("https://github.com/login/oauth/access_token",{method:"POST",headers:{Accept:"application/json","Content-Type":"application/json"},body:JSON.stringify({client_id:env.GITHUB_CLIENT_ID,client_secret:env.GITHUB_CLIENT_SECRET,code})});
  const token=await tokenRes.json(); if(!token.access_token) return new Response("GitHub sign-in failed.",{status:401});
  const userRes=await fetch("https://api.github.com/user",{headers:{Authorization:`Bearer ${token.access_token}`,Accept:"application/vnd.github+json","X-GitHub-Api-Version":"2022-11-28","User-Agent":"BeyondTheBeginningAdmin"}});
  const user=await userRes.json();
  if(!user.login||user.login.toLowerCase()!==String(env.ADMIN_GITHUB_USERNAME||"").toLowerCase()) return new Response("This GitHub account is not authorized to manage this website.",{status:403,headers:{"Set-Cookie":"btb_oauth_state=; Path=/api/auth; Max-Age=0; Secure; HttpOnly; SameSite=Lax"}});
  const session=await makeSession({login:user.login,access_token:token.access_token},env);
  const response=redirect("/admin/",{"Set-Cookie":sessionCookie(session)}); response.headers.append("Set-Cookie","btb_oauth_state=; Path=/api/auth; Max-Age=0; Secure; HttpOnly; SameSite=Lax"); return response;
}
