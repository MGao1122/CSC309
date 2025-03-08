import { findPosts, postsCount } from "@/utils/posts";
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

    let { query, tags, page = 1, perPage = 50 } = req.query;

    page = Number(page);
    perPage = Number(perPage);

    const skip = (Number(page) - 1) * Number(perPage);
    const take = Number(perPage);

    const filters: any = {
        visibility: true,
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
            ]
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
}
