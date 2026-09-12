import  prisma  from '@/lib/prisma'
import { NextRequest, NextResponse, userAgent } from 'next/server';
import { compare } from "bcryptjs";
import * as jose from "jose"



export async function POST(request : NextRequest) {
    
    const body = await request.json();

    console.log(body);

    if (body.email == null){
        return NextResponse.json(
            {
                message : "Email is required"
            }
        )
    }

    const user = await prisma.user.findFirst(
        {
            where : {
                email : body.email
            }

        }

    )
    
    console.log(user)
        

    if(user == null){
        return NextResponse.json ({
            message : "user not found"
        })
    }

    const isPasswordValid = await compare(body.password, user.password)

    if(isPasswordValid){
        
        const secretText = process.env.JOSE_SECRET
        const secret = new TextEncoder().encode(secretText)

        const  token = await new jose.SignJWT({
            email : user.email,
            firstName : user.firstName,
            lastName : user.lastName,
            role : user.role,
            privileges : user.privileges
        }).setProtectedHeader({alg : "HS256"}).sign(secret)

        const response = NextResponse.json({
            message : "LOgin successful",
            role : user.role, 
        })

        response.cookies.set({
            name : "token",
            value : token,
            httpOnly : true,
            secure : false,
            sameSite : "lax",
            maxAge : 60 * 60 * 24 * 7,
        })

        return response

    }else{
        return NextResponse.json({
            message: "Invalid Password"
        })

        
    }

}




