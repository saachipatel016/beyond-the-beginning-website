import { clearCookie, redirect } from "../../_auth.js";
export async function onRequestGet(){ return redirect("/admin/",{"Set-Cookie":clearCookie()}); }
