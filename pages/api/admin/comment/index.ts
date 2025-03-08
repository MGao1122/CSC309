import { verifyTokenMiddleware } from "@/utils/auth";
import { findCommentReports, findCommentReportsCount } from "@/utils/report";
import { NextApiRequest, NextApiResponse } from "next";

export const config = {
    api: {
        externalResolver: true,
    },
};

async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "GET") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    let { page = 1, perPage = 50, showHidden } = req.query;

    page = Number(page);
    perPage = Number(perPage);

    const skip = (Number(page) - 1) * Number(perPage);
    const take = Number(perPage);

    try {
        const count = await findCommentReportsCount(showHidden === "false");
        const totalPages = Math.ceil(count / take);

        if (count === 0) {
            return res.status(200).json({ results: [], page, perPage, totalPages });
        }

        if (Number(page) > totalPages) {
            return res.status(404).json({ error: "Page not found" });
        }

        const results = await findCommentReports(skip, take, showHidden === "false");

        return res.status(200).json({ results, page, perPage, totalPages });
    } catch (error) {
        return res.status(400).json({ error: "Something went wrong" });
    }
}

export default function protectedRoute(req: NextApiRequest, res: NextApiResponse) {
    verifyTokenMiddleware(req, res, () => handler(req, res), "admin");
}