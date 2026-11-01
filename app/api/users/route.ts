import { UserSelfUpdateRequestSchema } from '@/types/dto/UserSelfUpdateRequest';
import { UserRegistrationRequestSchema } from './../../../types/dto/UserRegistrationRequest';
import type {UserRegistrationRequest} from './../../../types/dto/UserRegistrationRequest';
import prisma from "@/lib/prisma";
import { getUser, isPrivileged } from "@/utils/authentication";
import bcrypt from "bcryptjs";
import { exportTraceState } from 'next/dist/trace';
import { NextRequest, NextResponse } from "next/server";
import z from 'zod';
import { UserUpdateByAdminRequestSchema } from '@/types/dto/UserUpdateByAdminRequest';

export async function GET(request : NextRequest){

    const havePrivilege = await isPrivileged (request, "users:read")

    if(!havePrivilege){
          return NextResponse.json(
            {
                message : "You dont have privileged to view users"
            },
            {
                status : 403
            }
            
        )

    }

    const pageNumberInString = request.nextUrl.searchParams.get("pageNumber") || "1"

    const pageSizeInString = request.nextUrl.searchParams.get("pageSize") || "10"

    const pageNumber = parseInt(pageNumberInString)
    const pageSize = parseInt(pageSizeInString)

    const userCount = await prisma.user.count()

    const totalPages = Math.ceil( userCount / pageSize )

    if( pageNumber > totalPages ) {
        return Response.json(
            {
                message : "Page Number exceeds tatal pages",
                totalPages : totalPages
            },
            {
                status : 400
            }
        )
    }

    const users = await prisma.user.findMany({
        skip : (pageNumber - 1) * pageSize,
        take : pageSize,
        select : {
            id : true,
            email : true,
            phone : true,
            firstName : true,
            lastName : true,
            password : false,
            role : true,
            status : true,
            createdAT : true,
            lastLogin : true,
            privileges : true

        }
    })

         return NextResponse.json (
            {
                message : "Users fetched successfully",
                users : users,
                pagination : {
                    pageNumber : pageNumber,
                    pageSize : pageSize,
                    totalPages : totalPages,
                    totalCount : userCount
                }

            }
        )
}


export async function POST(request : NextRequest) {

    const body = await request.json()

    try{

            const parsedBody = UserRegistrationRequestSchema.parse(body)


        // if(body.email == null) {
        //     return NextResponse.json( 
        //         {
        //             message : "Email is required"
        //         },
        //         {
        //             status : 422
        //         }
        //     )
        // }

        // if(body.firstName == null) {
        //     return NextResponse.json( 
        //         {
        //             message : "First name is required"
        //         },
        //         {
        //             status : 422
        //         }
        //     )
        // }

        
        // if(body.lastName == null) {
        //     return NextResponse.json( 
        //         {
        //             message : "Last name is required"
        //         },
        //         {
        //             status : 422
        //         }
        //     )
        // }

        
        // if(body.password == null) {
        //     return NextResponse.json( 
        //         {
        //             message : "Password is required"
        //         },
        //         {
        //             status : 422
        //         }
        //     )
        // }

        const existingUser = await prisma.user.findUnique(
            {
                where : {
                    email : body.email
                }
            }
        )

        if(existingUser != null) {
            return NextResponse.json(
                {
                    message : "User with this email already exists"
                },
                {
                    status : 409
                }
            )

        }

        const passwordHash = await bcrypt.hash(body.password, 12)

        await prisma.user.create( {
            data : {
                email : body.email,
                firstName : body.firstName,
                lastName : body.lastName,
                password : passwordHash,
                phone : body.phone

            }
        })

        return NextResponse.json(
            {
                message : "User created successfully"
            },
            {
                status : 201
            }
        )

    }catch(error){


        if(error instanceof z.ZodError){
            // console.log(error.issues[0]?.message ?? "invalid input")

            return NextResponse.json(
                {
                    message : error.issues[0]?.message?? "invalid input"
                },
                {
                    status : 400
                }
            )
        }


        console.log(error)
        return NextResponse.json(
            {
                message : "Invalid request body",
                error : error
            },
            {
                status : 400
            }
        )

    }
}

export async function PUT(request : NextRequest) {
    const id = request.nextUrl.searchParams.get("id")

    const requestedUser = await getUser(request)

    if(requestedUser == null) {
        return NextResponse.json(
            {
                message : "You are not logged in"
            },
            {
                status : 401
            }

        )
    }

    try{
        
        const body = await request.json()

        if(requestedUser.id == id) {

            UserSelfUpdateRequestSchema.parse(body)
        

            const user = await prisma.user.findUnique({
                where : {
                    id : id as string
                }
            })

            if(user == null ){
                return NextResponse.json(
                    {
                        message : "User Not found"
                    },
                    {
                        status : 404
                    }
                )
            }

            await prisma.user.update({
                where : {
                    id : id
                },
                data : {
                    email :body.email || user.email,
                    firstName : body.firstName || user.firstName,
                    lastName : body.lastName || user.lastName,
                    phone : body.phone || user.phone,
                    profileImage : body.profileImage || user.profileImage
                }
            })

            return NextResponse.json(
                {
                    message : "User Update successfuly"
                }
            )


        }else {

            const havePrivilage = await isPrivileged(request,"users:edit")

            if(!havePrivilage){
                return NextResponse.json(
                    {
                        message : "You do not have privilege to edit other users"
                    },
                    {
                        status : 403
                    }
                )
            }

            UserUpdateByAdminRequestSchema.parse(body)

            const user = await prisma.user.findUnique(
                {
                    where : {
                        id : id || "000"
                    }
                }
            )

            if(user == null){
                return NextResponse.json(
                    {
                        message : "User not found"
                    },
                    {
                        status : 404
                    }
                )
            }

            await prisma.user.update({
                where : {
                    id : id || "000"
                },
                data : {
                    email :body.email || user.email,
                    firstName : body.firstName || user.firstName,
                    lastName : body.lastName || user.lastName,
                    phone : body.phone || user.phone,
                    profileImage : body.profileImage || user.profileImage,
                    role : body.role || user.role,
                    status : body.status || user.status,
                    privileges : body.privileges || user.privileges

                }

            })

            return NextResponse.json(
                {
                    message : "User update successfully"
                }
            )

            
            
        }
        

    }catch(error){
        if(error instanceof z.ZodError){
            return NextResponse.json(
                {
                    message : error.issues[0]?.message ?? "Invalid input"
                },
                {
                    status : 400
                }
            )
        }

         return NextResponse.json(
            {
                message : "Server error",
                error : error
            },
            {
                status : 500
            }
            
        )

    }

   
}