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
    email : "admin@saloonneo.lk",
    firstName : "admin",
    lastName : "neo",
    password : "$2a$12$.sbZ4UIc7mRcgOtlHfDEp.coiR5jscJuS0pkjJyqzh9iDHpXHqxfK",
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