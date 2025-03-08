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
        const { id } = req.query;
        const { content } = req.body;

        if (!content) {
            return res.status(400).json({ error: "Content is required" });
        }

        try {
            const comment = await findCommentById(Number(id));
            if (!comment?.blogPostId) {
                return res.status(404).json({ error: "Invalid comment or missing blog post ID" });
            }

            if (!comment) {
                return res.status(404).json({ error: "Comment not found" });
            }

            if (comment.visibility === false) {
                return res.status(403).json({ error: "Forbidden" });
            }

            const post = await findPostsById(Number(comment.blogPostId));

            if (!post) {
                return res.status(404).json({ error: "Post not found" });
            }

            if (post.visibility === false) {
                return res.status(403).json({ error: "Forbidden" });
            }

            const newComment = await createComment(Number(comment.blogPostId), content, userId, Number(id));

            return res.status(200).json(newComment);
        } catch (error) {
            return res.status(400).json({ error: "Something went wrong" });
        }
    } else if (req.method === "DELETE") {
        const { id } = req.query;

        try {
            const comment = await findCommentById(Number(id));

            if (!comment) {
                return res.status(404).json({ error: "Comment not found" });
            }

            if (comment.authorId !== userId) {
                return res.status(403).json({ error: "Forbidden" });
            }

            if (comment.visibility === false) {
                return res.status(403).json({ error: "Forbidden" });
            }

            await deleteComment(Number(id));

            return res.status(204).end();
        } catch (error) {
            return res.status(400).json({ error: "Something went wrong" });
        }
    } else if (req.method === "PUT") {
        const { id } = req.query;
        const { upvote = false, downvote = false } = req.body;

        if (upvote && downvote) {
            return res.status(400).json({ error: "Cannot upvote and downvote at the same time" });
        }

        try {
            const comment = await findCommentById(Number(id));

            if (!comment) {
                return res.status(404).json({ error: "Comment not found" });
            }

            if (comment.visibility === false) {
                return res.status(403).json({ error: "Forbidden" });
            }

            let rating;

            if (upvote) {
                rating = await upvoteComment(Number(id), userId);
            } else if (downvote) {
                rating = await downvoteComment(Number(id), userId);
            } else {
                rating = await removeVoteComment(Number(id), userId);
            }

            return res.status(200).json({ rating });
        } catch (error) {
            return res.status(400).json({ error: "Something went wrong" });
        }
    } else {
        return res.status(405).json({ error: "Method not allowed" });
    }
}

export default function protectedRoute(req: NextApiRequest, res: NextApiResponse) {
    verifyTokenMiddleware(req, res, () => handler(req, res));
}
