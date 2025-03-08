import { verifyTokenMiddleware } from "@/utils/auth";
import { findPostsById } from "@/utils/posts";
import { reportPost } from "@/utils/report";
import { NextApiRequest, NextApiResponse } from "next";

export const config = {
    api: {
        externalResolver: true,
    },
};

async function handler(req: NextApiRequest & { userinfo?: { userId: number } }, res: NextApiResponse) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    const { post } = req.query;
    const { content } = req.body;
    const userId = req.userinfo?.userId;

    if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
    }

    try {
        const pos = await findPostsById(Number(post));

        if (!pos) {
            return res.status(404).json({ error: "Post not found" });
        }

        if (pos.visibility === false) {
            return res.status(403).json({ error: "Forbidden" });
        }

        const report = await reportPost(pos.id, userId, content);

        return res.status(201).json(report);
    } catch (error) {
        return res.status(400).json({ error: "Something went wrong" });
    }
}

export default function protectedRoute(req: NextApiRequest, res: NextApiResponse) {
    verifyTokenMiddleware(req, res, () => handler(req, res));
}
