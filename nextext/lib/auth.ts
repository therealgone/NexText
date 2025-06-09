import CredentialsProvider  from "next-auth/providers/credentials";
import NextAuth from "next-auth";
import { MongoClient } from "mongodb";
import bcrypt from "bcryptjs";
import Email from "next-auth/providers/email";

const client = new MongoClient(process.env.MONGOBD_URL!);

const handler = NextAuth ({
    providers:[
        CredentialsProvider({
         name:"Credentails",
         credentials:{
            email:{label:"Email",type:"text"},
            password:{label:"Password" ,type:"password"},
            
         },
        async authorize(Credentails){
         await client.connect();
         const db =client.db('NexText') 
         const user = await db.collection('users').findone({ email: Credentails?.email})
         
         if(!user) throw Error("No User Found");

         const isValid = await bcrypt.compare(Credentails!.password , user.password)
         if(!isValid) throw Error("Invalid Password")

        return{id:user._id, email:user.email}
        }
        })
    ],
    session: { strategy: "jwt" },
    secret: process.env.NEXTAUTH_SECRET,
});

export { handler as GET, handler as POST };
