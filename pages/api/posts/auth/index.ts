import { verifyTokenMiddleware } from "@/utils/auth";
import { verifyOrCreateTags } from "@/utils/tags";
import { verifyTemplates } from "@/utils/templates";
import { findPosts, postsCount, createPost } from "@/utils/posts";
import { NextApiRequest, NextApiResponse } from "next";
import { Prisma } from "@prisma/client";

export const config = {
    api: {
        externalResolver: true,
    },
};

async function handler(req: NextApiRequest & { userinfo?: { userId: number } }, res: NextApiResponse) {
    if (req.method === "GET") {
        let { query, tags, page = 1, perPage = 50 } = req.query;
        const userId = req.userinfo?.userId;

        page = Number(page);
        perPage = Number(perPage);

        const skip = (Number(page) - 1) * Number(perPage);
        const take = Number(perPage);

        const filters: any = {
            authorId: userId,
        };

        if (query) {
            const words = (query as string).split(" ");
            filters.OR = words.map(word => ({
                OR: [
                    { title: { contains: word } },
                    { description: { contains: word } },
                    { templates: { some: { title: { contains: word } } } },
                    { templates: { some: { description: { contains: word } } } },
                    { templates: { some: { content: { contains: word } } } },
                ],
            }));
        }

        if (tags) {
            filters.tags = { some: { name: { in: (tags as string).split(",") } } };
        }

        try {
            const count = await postsCount(filters);
            const totalPages = Math.ceil(count / perPage);

            if (count === 0) {
                return res.status(200).json({ results: [], page, perPage, totalPages });
            }

            if (page > totalPages) {
                return res.status(404).json({ error: "Page not found" });
            }

            const results = await findPosts(filters, skip, take);

            return res.status(200).json({ results, page, perPage, totalPages });
        } catch (error) {
            return res.status(400).json({ error: "Something went wrong" });
        }
    } else if (req.method === "POST") {
        const { title, description, tags, templates } = req.body;
        const userId = req.userinfo?.userId;

        if (!title || !description) {
            return res.status(400).json({ error: "Title and description are required" });
        }

        let verifyTemplate;
        try {
            verifyTemplate = await verifyTemplates(templates);
        } catch (error) {
            return res.status(404).json({ error: "Template not found" });
        }

        try {
            const verifyTags = await verifyOrCreateTags(tags);

            const data = <any> {
                title,
                description,
                tags: {
                    connect: verifyTags,
                },
                templates: {
                    connect: verifyTemplate,
                },
                authorId: userId,
            };

            const newPost = await createPost(data);

            return res.status(201).json(newPost);
        } catch (error) {
            return res.status(400).json({ error: "Something went wrong" });
        }
    } else {
        return res.status(405).json({ error: `Method ${req.method} not allowed` });
    }
}

export default function protectedRoute(req: NextApiRequest, res: NextApiResponse) {
    verifyTokenMiddleware(req, res, () => handler(req, res));
}
