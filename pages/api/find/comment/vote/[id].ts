import { PrismaClient } from '@prisma/client';
import { verifyTokenMiddleware } from '@/utils/auth';
import { NextApiRequest, NextApiResponse } from 'next';

interface CustomNextApiRequest extends NextApiRequest {
    userinfo?: {
        userId: number;
    };
}

const prisma = new PrismaClient();

export const config = {
    api: {
        externalResolver: true,
    },
};

async function handler(req: CustomNextApiRequest, res: NextApiResponse) {
    if (req.method !== "GET") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    const { id } = req.query;

    if (typeof id !== 'string' || isNaN(Number(id))) {
        return res.status(400).json({ error: "Invalid query parameter: id" });
    }

    try {
        const comment = await prisma.comment.findUnique({
            where: { id: Number(id) },
            select: {
                upUser: {
                    where: {
                        id: req.userinfo ? req.userinfo.userId : 1,
                    },
                },
                downUser: {
                    where: {
                        id: req.userinfo?.userId,
                    },
                },
            },
        });

        if (!comment) {
            return res.status(404).json({ error: "Comment not found" });
        }

        const upvoted = comment.upUser.length > 0;
        const downvoted = comment.downUser.length > 0;

        return res.status(200).json({ upvoted, downvoted });
    } catch (error) {
        console.error(error);
        return res.status(400).json({ error: "Something went wrong" });
    }
}

export default function protectedRoute(req: NextApiRequest, res: NextApiResponse) {
    return verifyTokenMiddleware(req, res, () => handler(req, res));
}
