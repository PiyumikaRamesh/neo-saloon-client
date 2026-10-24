import prisma from '@/lib/prisma';
import { compare } from 'bcryptjs';
import { NextRequest, NextResponse } from 'next/server.js';
import * as jose from "jose";

export async function POST(request : NextRequest){

    const body = await request.json();

    if (body.email == null){

        return NextResponse.json(
            {
                message : "Email is required"
            },
            {
                status : 422
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


    if (user == null){
        return NextResponse.json(
            {
                message : "user not found"
            },
            {
                status : 404
            }

        )
    }

    if(user.status != "ACTIVE") {
        return NextResponse.json (
            {
                message : "Your account is disabled. Please contact the administrator."
            },
            {
                status : 403
            }
        )
    }

    const isPasswordValid = await compare(body.password, user.password)

    if(isPasswordValid){

        await prisma.user.update(
            {
                where : {
                    id : user.id
                },

                data : {
                    lastLogin : new Date()
                }
            }
            
        )

        const secretText = process.env.JOSE_SECRET

        const secret = new TextEncoder().encode(secretText)

        const token = await new jose.SignJWT({
            id : user.id,
            email : user.email,
            firstName : user.firstName,
            lastName : user.lastName,
            role : user.role,
            privileges : user.privileges
        }).setProtectedHeader({ alg : "HS256"}).sign(secret)

        const response = NextResponse.json(
            {
                message: "Login Successful",
                role : user.role
            }
        )

        response.cookies.set(
            {
                name : "login-token",
                value : token,
                httpOnly : true, 
                secure : false,
                sameSite : "lax",
                maxAge : 60 * 60 * 24 * 7
            }
        )

        return response
       
    }else {
        return NextResponse.json(
            {
                message : "Invalid Password"
            },
            {
                status : 401
            }
        )
    }  

} 