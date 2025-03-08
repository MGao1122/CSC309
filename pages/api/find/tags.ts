import { getTags, tagsCount } from "@/utils/tags";
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

    let { page = 1, perPage = 50, query = ""} = req.query;

    page = Number(page);
    perPage = Number(perPage);

    const skip = (Number(page) - 1) * Number(perPage);
    const take = Number(perPage);

    try {
        const count = await tagsCount(query as string);
        const totalPages = Math.ceil(count / Number(perPage));

        if (count === 0) {
            return res.status(200).json({ tags: [], page, perPage, totalPages });
        }

        if (Number(page) > Number(totalPages)) {
            return res.status(404).json({ error: "Page not found" });
        }

        const tags = await getTags(skip, take, query as string);

        return res.status(200).json({ tags, page, perPage, totalPages });
    } catch (error) {
        console.error(error);
        return res.status(400).json({ error: "Something went wrong" });
    }
}
