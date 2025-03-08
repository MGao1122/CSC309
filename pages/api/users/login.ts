import { PrismaClient } from '@prisma/client';
import { verifyPassword, generateToken } from '../../../utils/auth';
import { NextApiRequest, NextApiResponse } from 'next';

const prisma = new PrismaClient();
const accessTime = process.env.ACCESS_TOKEN_EXPIRATION_TIME as string;
const refreshTime = process.env.REFRESH_TOKEN_EXPIRATION_TIME as string;

interface LoginRequestBody {
    userinfo: string;
    password: string;
}

interface User {
    id: number;
    username: string;
    email: string;
    firstName: string;
    lastName: string;
    avatar: Buffer | null;
    phone: string | null;
    role: string;
    password: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse): Promise<void> {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: `Method ${req.method} not allowed` });
    }

    const { userinfo, password }: LoginRequestBody = req.body;

    if (!userinfo || !password) {
        return res.status(400).json({ error: 'Email or username and password are required' });
    }

    try {
        let user: User | null;
        if (userinfo.includes('@')) {
            user = await prisma.user.findUnique({
                where: { email: userinfo },
            });
        } else {
            user = await prisma.user.findUnique({
                where: { username: userinfo },
            });
        }

        if (!user) {
            if (userinfo.includes('@')) {
                return res.status(401).json({ error: 'Invalid email or password' });
            } else {
                return res.status(401).json({ error: 'Invalid username or password' });
            }
        }

        const isPasswordValid: boolean = await verifyPassword(password, user.password);

        if (!isPasswordValid) {
            return res.status(401).json({ error: 'Incorrect password' });
        }

        const accessToken: string = await generateToken(
            {
                userId: user.id,
                username: user.username,
                role: user.role,
                type: 'access'
            },
            accessTime
        );

        const refreshToken: string = await generateToken(
            {
                userId: user.id,
                type: 'refresh'
            }, 
            refreshTime
        );

        const avatarString: string | null = user.avatar ? user.avatar.toString('base64') : null;

        return res.status(200).json({ "accessToken": accessToken, "refreshToken": refreshToken, "user": { "id": user.id, "username": user.username, "email": user.email, "firstName": user.firstName, "lastName": user.lastName, "avatar": avatarString, "phone": user.phone, "role":user.role } });

    } catch (error) {
        console.error(error);
        return res.status(400).json({ error: 'Something went wrong' });
    }
}