import { PrismaClient } from '@prisma/client';
import { verifyTokenMiddleware } from '@/utils/auth';
import { NextApiRequest, NextApiResponse } from 'next';

const prisma = new PrismaClient();

export const config = {
    api: {
        externalResolver: true,
    },
};

async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "GET") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    let { id, page = 1, perPage = 50 } = req.query;

    const parsedId = Number(id);
    const parsedPage = Number(page);
    const parsedPerPage = Number(perPage);

    if (isNaN(parsedId) || isNaN(parsedPage) || isNaN(parsedPerPage)) {
        return res.status(400).json({ error: "Invalid query parameters" });
    }

    const skip = (parsedPage - 1) * parsedPerPage;
    const take = parsedPerPage;

    try {
        const reportCount = await prisma.report.count({
            where: {
                blogPostId: parsedId,
            },
        });

        const totalPages = Math.ceil(reportCount / parsedPerPage);

        if (parsedPage > totalPages) {
            return res.status(404).json({ error: "Page not found" });
        }

        if (reportCount === 0) {
            return res.status(200).json({ results: [], page: parsedPage, perPage: parsedPerPage, totalPages });
        }

        const reports = await prisma.blogPost.findUnique({
            where: {
                id: parsedId,
            },
            select: {
                report: {
                    skip,
                    take,
                    select: {
                        id: true,
                        content: true,
                        authorId: true,
                    },
                },
            },
        });

        return res.status(200).json({ results: reports, page: parsedPage, perPage: parsedPerPage, totalPages });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: "Internal server error" });
    }
}

export default function protectedRoute(req: NextApiRequest, res: NextApiResponse) {
    return verifyTokenMiddleware(req, res, () => handler(req, res), "admin");
}
