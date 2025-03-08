import { NextApiRequest, NextApiResponse } from "next";
import { findTemplates, templatesCount } from "@/utils/templates";

export const config = {
    api: {
        externalResolver: true,
    },
};

type CustomNextApiRequest = NextApiRequest & {
    query: {
        query?: string;
        tags?: string;
        page?: string;
        perPage?: string;
    };
};

export default async function handler(req: CustomNextApiRequest, res: NextApiResponse) {
    if (req.method !== "GET") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    let { query, tags, page = "1", perPage = "50" } = req.query;

    const pageNumber = Number(page);
    const perPageNumber = Number(perPage);

    const skip = (pageNumber - 1) * perPageNumber;
    const take = perPageNumber;

    const filters: any = {
        visibility: true,
    };

    if (query) {
        const words = query.split(" ");
        filters.OR = words.map(word => ({
            OR: [
                { title: { contains: word } },
                { description: { contains: word } },
                { content: { contains: word } },
            ]
        }));
    }

    if (tags) {
        filters.tags = { some: { name: { in: tags.split(",") } } };
    }

    try {
        const count = await templatesCount(filters);
        const totalPages = Math.ceil(count / perPageNumber);

        if (count === 0) {
            return res.status(200).json({ results: [], page: pageNumber, perPage: perPageNumber, totalPages });
        }

        if (pageNumber > totalPages) {
            return res.status(404).json({ error: "Page not found" });
        }

        const results = await findTemplates(filters, skip, take);
        
        return res.status(200).json({ results, page: pageNumber, perPage: perPageNumber, totalPages });
    } catch (error) {
        return res.status(400).json({ error: "Something went wrong" });
    }
}