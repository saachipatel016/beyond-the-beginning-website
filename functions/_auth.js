const enc = new TextEncoder();
const COOKIE = "btb_admin_session";
function b64(bytes) { let s = ""; for (const b of bytes) s += String.fromCharCode(b); return btoa(s).replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/g,""); }
function unb64(s) { s=s.replace(/-/g,"+").replace(/_/g,"/"); s += "=".repeat((4-s.length%4)%4); const raw=atob(s); return Uint8Array.from(raw,c=>c.charCodeAt(0)); }
async function key(env) { const digest=await crypto.subtle.digest("SHA-256",enc.encode(env.SESSION_SECRET||"")); return crypto.subtle.importKey("raw",digest,{name:"AES-GCM"},false,["encrypt","decrypt"]); }
export async function makeSession(data,env) { const iv=crypto.getRandomValues(new Uint8Array(12)); const payload=enc.encode(JSON.stringify({...data,exp:Date.now()+8*60*60*1000})); const cipher=await crypto.subtle.encrypt({name:"AES-GCM",iv},await key(env),payload); return b64(new Uint8Array([...iv,...new Uint8Array(cipher)])); }
export async function readSession(request,env) { try { const cookie=(request.headers.get("Cookie")||"").split(";").map(x=>x.trim()).find(x=>x.startsWith(COOKIE+"=")); if(!cookie)return null; const raw=unb64(cookie.slice(COOKIE.length+1)); const iv=raw.slice(0,12), data=raw.slice(12); const plain=await crypto.subtle.decrypt({name:"AES-GCM",iv},await key(env),data); const s=JSON.parse(new TextDecoder().decode(plain)); if(!s.exp||s.exp<Date.now())return null; return s; } catch { return null; } }
export function sessionCookie(value,maxAge=28800) { return `${COOKIE}=${value}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${maxAge}`; }
export function clearCookie() { return `${COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`; }
export function redirect(url,headers={}) { return new Response(null,{status:302,headers:{Location:url,...headers}}); }
export function allowedPath(path) { return new Set(["index.html","about.html","resources.html","family-support.html","care-packages.html","hospital-partnerships.html","get-involved.html","contact.html","donate.html","support.html","privacy.html","medical-disclaimer.html"]).has(path); }
export async function requireAdmin(request,env) { const s=await readSession(request,env); if(!s||s.login?.toLowerCase()!==env.ADMIN_GITHUB_USERNAME?.toLowerCase()) return null; return s; }
