import { PrismaClient, Prisma } from "../app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import "dotenv/config";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({
  adapter,
});

const userData: Prisma.UserCreateInput[] = [
    {
        email : "admin@saloonneo.com",
        firstName : "Admin",
        lastName : "Leo",
        password : "$2a$12$5tu8ejV2OgG5FBrmhmp4Fe9QSQNKdvfbsieexsiSlpbvODVLpqJjq",
        role : "ADMIN",
        privileges : []

    }
];

export async function main() {
  for (const u of userData) {
    await prisma.user.create({ data: u });
  }
}

main();