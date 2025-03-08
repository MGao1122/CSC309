import { PrismaClient } from '@prisma/client';
import { verifyToken, generateToken } from '../../../utils/auth';
import { NextApiRequest, NextApiResponse } from 'next';

const prisma = new PrismaClient();
const accessTime = process.env.ACCESS_TOKEN_EXPIRATION_TIME as string;

interface CustomNextApiRequest extends NextApiRequest {
    body: {
        refreshToken: string;
    };
}

export default async function handler(req: CustomNextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: `Method ${req.method} not allowed` });
    }

    const { refreshToken } = req.body;

    if (!refreshToken) {
        return res.status(400).json({ error: 'Refresh token is required' });
    }

    try {
        const decoded = await verifyToken(refreshToken);

        if (!decoded) {
            return res.status(401).json({ error: 'Invalid or expired refresh token' });
        }

        if (decoded.type !== 'refresh') {
            return res.status(401).json({ error: 'Invalid token type' });
        }

        const user = await prisma.user.findUnique({
            where: { id: decoded.userId },
        });

        if (!user) {
            return res.status(401).json({ error: 'User not found' });
        }

        const accessToken = await generateToken(
            {
                userId: user.id,
                username: user.username,
                role: user.role,
                type: 'access',
            },
            accessTime
        );

        return res.status(200).json({ accessToken });
    } catch (error) {
        console.error(error);
        return res.status(400).json({ error: 'Something went wrong' });
    }
}
