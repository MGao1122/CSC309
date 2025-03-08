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

    let { id } = req.query;

    if (!id || isNaN(Number(id))) {
        return res.status(400).json({ error: "Invalid template ID" });
    }

    const templateId = Number(id);

    try {
        const template = await prisma.template.findUnique({
            where: {
                id: templateId,
            },
        });

        if (!template) {
            return res.status(404).json({ error: "Template not found" });
        }

        return res.status(200).json(template);
    } catch (error) {
        console.error("Error fetching template: ", error);
        return res.status(500).json({ error: "Internal server error" });
    }
}

export default function protectedRoute(req: NextApiRequest, res: NextApiResponse) {
    return verifyTokenMiddleware(req, res, () => handler(req, res), "admin");
}