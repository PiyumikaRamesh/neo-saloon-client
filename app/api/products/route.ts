import { NextRequest, NextResponse } from 'next/server.js';
import * as jose from "jose";
import { isPrivileged } from '@/utils/authentication';

export async function GET(request:  NextRequest){


}

export async function POST(request : NextRequest){

    const havePrivilede = await isPrivileged(request, "products:add")

    if(havePrivilede){
        
        const body = await request.json()
        
    }else{
        return NextResponse.json(
            {
                message : "You do not have the required privilege to add a product"
            },
            {
                status : 403
            }
        )
    }

}

  