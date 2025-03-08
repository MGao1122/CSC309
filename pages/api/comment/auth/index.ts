import { findCommentById, createComment, deleteComment, upvoteComment, downvoteComment, removeVoteComment } from '@/utils/comments';
import { verifyTokenMiddleware } from '@/utils/auth';
import { findPostsById } from '@/utils/posts';
import { NextApiRequest, NextApiResponse } from 'next';

export const config = {
    api: {
        externalResolver: true,
    },
};

async function handler(req: NextApiRequest, res: NextApiResponse) {
    const userId = (req as any).userinfo?.userId;
    if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
    }

    if (req.method === "POST") {
        const { postId, content } = req.body;

        if (!postId || !content) {
            return res.status(400).json({ error: "Post ID and content must be provided" });
        }

        try {
            const post = await findPostsById(postId);

            if (!post) {
                return res.status(404).json({ error: "Post not found" });
            }

            if (post.visibility === false) {
                return res.status(403).json({ error: "Forbidden" });
            }

            const comment = await createComment(postId, content, userId);
            return res.status(201).json(comment);
        } catch (error) {
            console.log(error);
            return res.status(400).json({ error: "Something went wrong" });
        }
    } else {
        return res.status(405).json({ error: "Method not allowed" });
    }
}

export default function protectedRoute(req: NextApiRequest, res: NextApiResponse) {
    verifyTokenMiddleware(req, res, () => handler(req, res));
}
