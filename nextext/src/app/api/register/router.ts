import { MongoClient } from "mongodb";
import bcrypt from "bcryptjs";

const client = new MongoClient(process.env.MONGODB_URI!);
export async function POST(req: Request) {

    try{
        const body = await req.json();
        const {email,password} =body
    if(!email || !password){
        return new Response("Email and Pasword Required",{status:400});
    }

    await client.connect();

    const db= client.db("NexText")
    const existinguser =await db.collection("users").findOne({email});

    if(existinguser){
        return new Response("User already exists",{status:400});
    }
     const hashedpassowrd = await bcrypt.hash(password,10);
     
     await db.collection("users").insertOne({
        email,
        password:hashedpassowrd,
     });
     
     return new Response("User created successfully",{status:201});

    
    
    } 
    
    catch(err){

        console.error("Registration error",err);
        return new Response("Internal Server Error",{status:500});
    }
    


}