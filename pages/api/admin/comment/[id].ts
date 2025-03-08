import { PrismaClient } from '@prisma/client';
import { verifyTokenMiddleware } from '@/utils/auth';
import { NextApiRequest, NextApiResponse } from 'next';

const prisma = new PrismaClient();

export const config = {
    api: {
        externalResolver: true,
    },
};

async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { id } = req.query;

    const numericId = Number(id);

    if (isNaN(numericId)) {
        return res.status(400).json({ error: 'Invalid ID' });
    }

    try {
        const template = await prisma.comment.findUnique({
            where: {
                id: numericId,
            },
        });

        if (!template) {
            return res.status(404).json({ error: 'Comment not found' });
        }

        return res.status(200).json(template);
    } catch (error) {
        return res.status(500).json({ error: 'Internal server error' });
    }
}

export default function protectedRoute(req: NextApiRequest, res: NextApiResponse) {
    return verifyTokenMiddleware(req, res, () => handler(req, res), 'admin');
}
