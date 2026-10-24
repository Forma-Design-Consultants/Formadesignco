import type { Metadata } from "next";
export const metadata: Metadata = {title:"Forma Studio private preview",description:"Isolated demo preview of Forma Studio PR 18",robots:{index:false,follow:false}};
export default function Layout({children}:{children:React.ReactNode}) {return <html lang="en"><body>{children}</body></html>;}
