import { findPostsById, updatePost, deletePost, upvotePost, downvotePost, removeVotePost } from "@/utils/posts";
import { verifyTemplates } from "@/utils/templates";
import { verifyTokenMiddleware } from "@/utils/auth";
import { verifyOrCreateTags } from "@/utils/tags";
import { NextApiRequest, NextApiResponse } from "next";

export const config = {
    api: {
        externalResolver: true,
    },
};

async function handler(req: NextApiRequest & { userinfo?: { userId: number; role?: string } }, res: NextApiResponse) {
    if (req.method === "PUT") {
        const { id } = req.query;
        const { title, description, templates, tags } = req.body;
        const userId = req.userinfo?.userId;

        if (!title && !description && !templates && !tags) {
            return res.status(400).json({ error: "At least one field must be provided" });
        }

        try {
            const post = await findPostsById(Number(id));

            if (!post) {
                return res.status(404).json({ error: "Post not found" });
            }

            if (post.authorId !== userId) {
                return res.status(403).json({ error: "Forbidden" });
            }

            if (post.visibility === false) {
                return res.status(403).json({ error: "Forbidden" });
            }

            const verifiedTemplates = await verifyTemplates(templates);
            const verifyTags = await verifyOrCreateTags(tags);

            const data = {
                title: title,
                description: description,
                templates: {
                    set: verifiedTemplates,
                },
                tags: {
                    set: verifyTags,
                },
            };

            const updatedPost = await updatePost(Number(id), data);

            return res.status(200).json(updatedPost);
        } catch (error) {
            console.log(error);
            return res.status(400).json({ error: "Something went wrong" });
        }
    } else if (req.method === "DELETE") {
        const { id } = req.query;
        const userId = req.userinfo?.userId;

        try {
            const post = await findPostsById(Number(id));

            if (!post) {
                return res.status(404).json({ error: "Post not found" });
            }

            if (post.authorId !== userId) {
                return res.status(403).json({ error: "Forbidden" });
            }

            await deletePost(Number(id));

            return res.status(204).end();
        } catch (error) {
            return res.status(400).json({ error: "Something went wrong" });
        }
    } else if (req.method === "GET") {
        const { id } = req.query;
        const userId = req.userinfo?.userId;

        try {
            const post = await findPostsById(Number(id));

            if (!post) {
                return res.status(404).json({ error: "Post not found" });
            }

            if (post.authorId !== userId && req.userinfo?.role !== "admin") {
                return res.status(403).json({ error: "Forbidden" });
            }

            return res.status(200).json(post);
        } catch (error) {
            return res.status(400).json({ error: "Something went wrong" });
        }
    } else if (req.method === "POST") {
        const { upvote = false, downvote = false } = req.body;
        const { id } = req.query;
        const userId = req.userinfo?.userId;
        
        if (upvote && downvote) {
            return res.status(400).json({ error: "Cannot upvote and downvote at the same time" });
        }

        try {
            const post = await findPostsById(Number(id));

            if (!post) {
                return res.status(404).json({ error: "Post not found" });
            }

            if (post.visibility === false) {
                return res.status(403).json({ error: "Forbidden" });
            }

            let rating;

            if (upvote) {
                rating = await upvotePost(Number(id), Number(userId));
            } else if (downvote) {
                rating = await downvotePost(Number(id), Number(userId));
            } else {
                rating = await removeVotePost(Number(id), Number(userId));
            }

            return res.status(200).json({ rating });
        } catch (error) {
            console.log(error);
            return res.status(400).json({ error: "Something went wrong"});
        }
    } else {
        return res.status(405).json({ error: `Method ${req.method} not allowed` });
    }
}

export default function protectedRoute(req: NextApiRequest, res: NextApiResponse) {
    verifyTokenMiddleware(req, res, () => handler(req, res));
}
