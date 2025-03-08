import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../../../utils/auth';
import { NextApiRequest, NextApiResponse } from 'next';

const prisma = new PrismaClient();

interface SignupRequestBody {
    username: string;
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    avatar?: string;
    phone?: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: `Method ${req.method} not allowed` });
    }

    const { username, email, password, firstName, lastName, avatar, phone }: SignupRequestBody = req.body;

    if (!username || !email || !password || !firstName || !lastName) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
        const existingUserByEmail = await prisma.user.findUnique({
            where: { email },
        });

        const existingUserByUsername = await prisma.user.findUnique({
            where: { username },
        });

        if (existingUserByEmail && existingUserByUsername) {
            return res.status(400).json({ error: 'Username and Email should be unique' });
        }

        if (existingUserByEmail) {
            return res.status(400).json({ error: 'Email should be unique' });
        }

        if (existingUserByUsername) {
            return res.status(400).json({ error: 'Username should be unique' });
        }

        const hashedPassword = await hashPassword(password);

        const newUser = await prisma.user.create({
            data: {
                username: username,
                email: email,
                password: hashedPassword,
                firstName: firstName,
                lastName: lastName,
                avatar: avatar ? Buffer.from(avatar, 'base64') : null,
                phone: phone,
            },
            select: {
                id: false,
                username: true,
                email: true,
                firstName: true,
                lastName: true,
                avatar: false,
                role: false,
                phone: false,
            },
        });

        return res.status(201).json({ message: 'User signup successfully', user: newUser });

    } catch (error) {
        console.error(error);
        return res.status(400).json({ error: 'Something went wrong' });
    }
}