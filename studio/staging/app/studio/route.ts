import html from '../../lib/studio-html';
export const dynamic='force-dynamic';
export async function GET(){return new Response(html,{headers:{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store','X-Robots-Tag':'noindex, nofollow','Content-Security-Policy':"default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self'; frame-ancestors 'self'; base-uri 'self'; form-action 'self'",'X-Content-Type-Options':'nosniff','Referrer-Policy':'same-origin'}});}
