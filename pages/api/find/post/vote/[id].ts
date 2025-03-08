import { PrismaClient } from "@prisma/client";
import { verifyTokenMiddleware } from "@/utils/auth";
import { NextApiRequest, NextApiResponse } from "next";

const prisma = new PrismaClient();

export const config = {
    api: {
        externalResolver: true,
    },
};

type CustomNextApiRequest = NextApiRequest & {
    userinfo?: {
        userId: number;
        role?: string;
    };
};

export default function protectedRoute(req: CustomNextApiRequest, res: NextApiResponse) {
    verifyTokenMiddleware(req, res, () => handler(req, res));
}

async function handler(req: CustomNextApiRequest, res: NextApiResponse) {
    if (req.method !== "GET") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    const { id } = req.query;

    if (typeof id !== 'string' || isNaN(Number(id))) {
        return res.status(400).json({ error: "Invalid query parameter" });
    }

    try {
        const post = await prisma.blogPost.findUnique({
            where: { id: Number(id) },
            select: {
                upUser: {
                    where: {
                        id: req.userinfo?.userId,
                    },
                },
                downUser: {
                    where: {
                        id: req.userinfo?.userId,
                    },
                },
            },
        });

        if (!post) {
            return res.status(404).json({ error: "Post not found" });
        }

        const upvoted = post.upUser.length > 0;
        const downvoted = post.downUser.length > 0;

        return res.status(200).json({ upvoted, downvoted });
    } catch (error) {
        console.error(error);
        return res.status(400).json({ error: "Something went wrong" });
    }
}
