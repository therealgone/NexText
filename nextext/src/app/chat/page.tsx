import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/auth";
import { redirect } from "next/navigation";

export default async function ChatPage() {

    const session = await getServerSession(authOptions);

    if(!session){
        redirect("/login");
    }
 return(
    <div className="text-white">
      <h1>Welcome, {session.user?.email}</h1>
      {/* chat UI here */}
    </div>
 );    
}

