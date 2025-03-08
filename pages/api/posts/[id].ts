import { findPostsById } from "@/utils/posts";
import { NextApiRequest, NextApiResponse } from "next";

export const config = {
    api: {
        externalResolver: true,
    },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "GET") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    const { id } = req.query;

    if (!id || isNaN(Number(id))) {
        return res.status(400).json({ error: "Invalid or missing post ID" });
    }

    try {
        const post = await findPostsById(Number(id));

        if (!post) {
            return res.status(404).json({ error: "Post not found" });
        }

        if (post.visibility === false) {
            return res.status(403).json({ error: "Forbidden" });
        }

        return res.status(200).json(post);
    } catch (error) {
        return res.status(400).json({ error: "Something went wrong" });
    }
}