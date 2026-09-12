import { NextRequest } from 'next/server';
import { getUser } from '@/utils/authintication';


export function POST(request : NextRequest){

    const user = getUser(request)

    console.log("User: ",user)
}
