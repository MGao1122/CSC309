import { PrismaClient } from '@prisma/client';
import { verifyTokenMiddleware } from '@/utils/auth';
import { NextApiRequest, NextApiResponse } from 'next';

const prisma = new PrismaClient();

export const config = {
    api: {
        externalResolver: true,
    },
};

type CustomNextApiRequest = NextApiRequest & {
    userinfo?: {
        userId: number;
    };
};

interface UpdateUserProfileRequestBody {
    username?: string;
    email?: string;
    firstName?: string;
    lastName?: string;
    avatar?: string;
    phone?: string;
}

async function handler(req: CustomNextApiRequest, res: NextApiResponse) {
    if (req.method !== 'PUT') {
        return res.status(405).json({ error: `Method ${req.method} not allowed` });
    }

    const { username, email, firstName, lastName, avatar, phone }: UpdateUserProfileRequestBody = req.body;

    if (!username && !email && !firstName && !lastName && !avatar && !phone) {
        return res.status(400).json({ error: 'At least one field must be provided' });
    }

    try {
        if (!req.userinfo) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const user = await prisma.user.findUnique({
            where: { id: req.userinfo.userId },
        });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        if (username && username !== user.username) {
            const existingUser = await prisma.user.findUnique({
                where: { username: username },
            });

            if (existingUser !== null) {
                return res.status(409).json({ error: 'Username should be unique' });
            }
        }

        if (email && email !== user.email) {
            const existingUser = await prisma.user.findUnique({
                where: { email: email },
            });

            if (existingUser !== null) {
                return res.status(409).json({ error: 'Email should be unique' });
            }
        }

        const data: Partial<UpdateUserProfileRequestBody> & { avatar?: any } = {};

        if (username) {
            data.username = username;
        }

        if (email) {
            data.email = email;
        }

        if (firstName) {
            data.firstName = firstName;
        }

        if (lastName) {
            data.lastName = lastName;
        }

        if (avatar) {
            data.avatar = Buffer.from(avatar, 'base64');
        }

        if (phone) {
            data.phone = phone;
        }

        const updatedUser = await prisma.user.update({
            where: { id: req.userinfo.userId },
            data,
            select: {
                username: true,
                firstName: true,
                lastName: true,
            },
        });

        return res.status(200).json({ message: 'User profile updated successfully', user: updatedUser });
    } catch (error) {
        console.error('Error updating user profile:', error);
        return res.status(400).json({ error: 'Something went wrong' });
    }
}

export default function protectedRoute(req: NextApiRequest, res: NextApiResponse) {
    verifyTokenMiddleware(req, res, () => handler(req, res));
}