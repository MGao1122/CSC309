import { findTemplateChildren, templateChildrenCount } from "@/utils/templates";
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

    const { child, page = 1, perPage = 50 } = req.query;

    const skip = (Number(page) - 1) * Number(perPage);
    const take = Number(perPage);

    if (typeof child !== 'string' || isNaN(Number(child))) {
        return res.status(400).json({ error: "Invalid query parameter" });
    }

    try {
        const count = await templateChildrenCount(Number(child));
        const totalPages = Math.ceil(count / take);

        if (count === 0) {
            return res.status(200).json({ results: [], page, perPage, totalPages });
        }

        if (Number(page) > totalPages) {
            return res.status(404).json({ error: "Page not found" });
        }

        const results = await findTemplateChildren(Number(child), skip, take);

        if (!results.length || results[0].visibility === false) {
            return res.status(403).json({ error: "Forbidden" });
        }
        
        return res.status(200).json({ results, page, perPage, totalPages });
    } catch (error) {
        console.error(error);
        return res.status(400).json({ error: "Something went wrong" });
    }
}
