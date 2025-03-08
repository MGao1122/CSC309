import { PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { id } = req.query;

    if (!id || typeof id !== 'string' || isNaN(Number(id))) {
        return res.status(400).json({ error: 'Valid User ID is required' });
    }

    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const user = await prisma.user.findUnique({
            where: { id: parseInt(id) },
            select: {
                id: true,
                username: true,
                firstName: true,
                lastName: true,
                email: true,
                avatar: true,
            },
        });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const avatarString = user.avatar ? user.avatar.toString('base64') : null;

        res.status(200).json({ id: user.id, username: user.username, firstName: user.firstName, lastName: user.lastName, email: user.email, avatar: avatarString });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    } finally {
        await prisma.$disconnect();
    }
}
