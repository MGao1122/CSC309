import { PrismaClient } from '@prisma/client';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

const ADMIN_USERNAME = process.env.ADMIN_USERNAME;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const ADMIN_ROLE = process.env.ADMIN_ROLE;
const ADMIN_FIRST_NAME = process.env.ADMIN_FIRST_NAME;
const ADMIN_LAST_NAME = process.env.ADMIN_LAST_NAME;
const salt = Number(process.env.SALT_ROUNDS);

if (!ADMIN_USERNAME || !ADMIN_PASSWORD || !ADMIN_EMAIL || !ADMIN_ROLE || !ADMIN_FIRST_NAME || !ADMIN_LAST_NAME || isNaN(salt)) {
    console.error("Missing or invalid environment variables. Please check your .env file.");
    process.exit(1);
}

async function main() {
    try {
        const existingUserByEmail = await prisma.user.findUnique({ where: { email: ADMIN_EMAIL } });
        const existingUserByUsername = await prisma.user.findUnique({ where: { username: ADMIN_USERNAME } });

        if (existingUserByEmail || existingUserByUsername) {
            console.log("A user with matching email or username already exists.");

            return;
        }

        const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, salt);

        await prisma.user.create({
            data: {
                username: ADMIN_USERNAME,
                password: hashedPassword,
                email: ADMIN_EMAIL,
                role: ADMIN_ROLE,
                firstName: ADMIN_FIRST_NAME,
                lastName: ADMIN_LAST_NAME,
            },
        });

        console.log(`New admin user created with username: ${ADMIN_USERNAME}`);
    } catch (error) {
        console.error("Error during database operations:", error);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

main();
