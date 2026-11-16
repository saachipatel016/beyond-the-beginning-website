import { requireAdmin, allowedPath } from "../_auth.js";
const headers={"Content-Type":"application/json; charset=utf-8","Cache-Control":"no-store"};
function toBase64(bytes){let binary="";for(let i=0;i<bytes.length;i+=0x8000)binary+=String.fromCharCode(...bytes.subarray(i,i+0x8000));return btoa(binary);}
function cfg(env){return env.GITHUB_OWNER&&env.GITHUB_REPO&&env.GITHUB_BRANCH;}
async function gh(path,session,env,init={}) { const url=`https://api.github.com/repos/${env.GITHUB_OWNER}/${env.GITHUB_REPO}/contents/${path}?ref=${encodeURIComponent(env.GITHUB_BRANCH)}`; return fetch(url,{...init,headers:{Authorization:`Bearer ${session.access_token}`,Accept:"application/vnd.github+json","X-GitHub-Api-Version":"2022-11-28","User-Agent":"BeyondTheBeginningAdmin",...(init.headers||{})}}); }
export async function onRequestGet({request,env}) {
 const s=await requireAdmin(request,env); if(!s)return new Response(JSON.stringify({error:"Unauthorized"}),{status:401,headers}); if(!cfg(env))return new Response(JSON.stringify({error:"GitHub repository settings are missing."}),{status:503,headers});
 const path=new URL(request.url).searchParams.get("path");
 if(path){if(!allowedPath(path))return new Response(JSON.stringify({error:"File not editable"}),{status:400,headers}); const r=await gh(path,s,env); if(!r.ok)return new Response(JSON.stringify({error:"Could not load file from GitHub."}),{status:r.status,headers}); const f=await r.json(); let content=""; try{content=atob(f.content.replace(/\n/g,""));}catch{} return new Response(JSON.stringify({path,sha:f.sha,content:new TextDecoder().decode(Uint8Array.from(content,c=>c.charCodeAt(0)))}),{headers});}
 return new Response(JSON.stringify({login:s.login,files:["index.html","about.html","resources.html","family-support.html","care-packages.html","hospital-partnerships.html","get-involved.html","contact.html","donate.html","support.html","privacy.html","medical-disclaimer.html"]}),{headers});
}
export async function onRequestPost({request,env}) {
 const s=await requireAdmin(request,env); if(!s)return new Response(JSON.stringify({error:"Unauthorized"}),{status:401,headers});
 if(new URL(request.url).origin!==request.headers.get("Origin"))return new Response(JSON.stringify({error:"Origin check failed"}),{status:403,headers});
 const body=await request.json(); const path=body.path, content=body.content, sha=body.sha;
 if(!allowedPath(path)||typeof content!=="string"||content.length>500000)return new Response(JSON.stringify({error:"Invalid file or content"}),{status:400,headers});
 const payload={message:`Update ${path} via Beyond the Beginning admin`,content:toBase64(new TextEncoder().encode(content)),branch:env.GITHUB_BRANCH,sha};
 const url=`https://api.github.com/repos/${env.GITHUB_OWNER}/${env.GITHUB_REPO}/contents/${path}`;
 const r=await fetch(url,{method:"PUT",headers:{Authorization:`Bearer ${s.access_token}`,Accept:"application/vnd.github+json","X-GitHub-Api-Version":"2022-11-28","User-Agent":"BeyondTheBeginningAdmin","Content-Type":"application/json"},body:JSON.stringify(payload)});
 const out=await r.json(); if(!r.ok)return new Response(JSON.stringify({error:out.message||"GitHub could not save this change."}),{status:r.status,headers});
 return new Response(JSON.stringify({ok:true,message:"Saved to GitHub. Cloudflare Pages will deploy the update automatically."}),{headers});
}
