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
    if (req.method !== "GET") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    let { id } = req.query;

    if (!id || isNaN(Number(id))) {
        return res.status(400).json({ error: "Invalid post ID" });
    }

    const postId = Number(id);

    try {
        const blogPost = await prisma.blogPost.findUnique({
            where: {
                id: postId,
            },
        });

        if (!blogPost) {
            return res.status(404).json({ error: "Post not found" });
        }

        return res.status(200).json(blogPost);
    } catch (error) {
        console.error("Error fetching post: ", error);
        return res.status(500).json({ error: "Internal server error" });
    }
}

export default function protectedRoute(req: NextApiRequest, res: NextApiResponse) {
    return verifyTokenMiddleware(req, res, () => handler(req, res), "admin");
}