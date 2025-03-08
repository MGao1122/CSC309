import { findPostsById, findPostTemplates, postTemplatesCount } from "@/utils/posts";
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

    const { template, page = 1, perPage = 50 } = req.query;

    // if (typeof template !== 'number' || isNaN(Number(page)) || isNaN(Number(perPage))) {
    //     return res.status(400).json({ error: "Invalid query parameters" });
    // }

    const skip = (Number(page) - 1) * Number(perPage);
    const take = Number(perPage);

    try {
        const post = await findPostsById(Number(template));

        if (!post) {
            return res.status(404).json({ error: "Post not found" });
        }
        const count = await postTemplatesCount(Number(template));
        if (!count) {
            return res.status(200).json({ results: [], page, perPage, totalPages: 0 });
        }

        const totalPages = Math.ceil(count / Number(perPage));

        if (count === 0) {
            return res.status(200).json({ results: [], page, perPage, totalPages });
        }

        if (Number(page) > totalPages) {
            return res.status(404).json({ error: "Page not found" });
        }

        const results = await findPostTemplates(Number(template), skip, take);

        if (!results) return;

        if (results.visibility === false) {
            return res.status(403).json({ error: "Forbidden" });
        }

        return res.status(200).json({ results, page, perPage, totalPages });
    } catch (error) {
        console.error(error);
        return res.status(400).json({ error: "Something went wrong" });
    }
}
