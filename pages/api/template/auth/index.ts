import { NextApiRequest, NextApiResponse } from "next";
import { verifyTokenMiddleware } from "@/utils/auth";
import { verifyOrCreateTags } from "@/utils/tags";
import { findTemplates, templatesCount, createTemplate, findTemplateById } from "@/utils/templates";

export const config = {
    api: {
        externalResolver: true,
    },
};

type CustomNextApiRequest = NextApiRequest & {
    userinfo?: {
        userId: number;
    };
};

async function handler(req: CustomNextApiRequest, res: NextApiResponse) {
    if (req.method === "GET") {
        let { query, tags, page = 1, perPage = 50 } = req.query;

        page = Number(page);
        perPage = Number(perPage);

        const skip = (Number(page) - 1) * Number(perPage);
        const take = Number(perPage);
        const userId = req.userinfo?.userId;

        if (!userId) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        const filters: any = {
            authorId: userId,
        };

        if (query) {
            const words = (query as string).split(" ");
            filters.OR = words.map((word) => ({
                OR: [
                    { title: { contains: word } },
                    { description: { contains: word } },
                    { content: { contains: word } },
                ],
            }));
        }

        if (tags) {
            filters.tags = { some: { name: { in: (tags as string).split(",") } } };
        }

        try {
            const count = await templatesCount(filters);
            const totalPages = Math.ceil(count / perPage);

            if (count === 0) {
                return res.status(200).json({ results: [], page, perPage, totalPages });
            }

            if (page > totalPages) {
                return res.status(404).json({ error: "Page not found" });
            }

            const results = await findTemplates(filters, skip, take);

            return res.status(200).json({ results, page, perPage, totalPages });
        } catch (error) {
            return res.status(400).json({ error: "Something went wrong" });
        }
    } else if (req.method === "POST") {
        const { title, description, tags, content, language, parent } = req.body;
        const userId = req.userinfo?.userId;

        if (!userId) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        if (!title || !content || !language) {
            return res.status(400).json({ error: "Title, content and language are required" });
        }

        if (parent) {
            let parentTemplate;
            try {
                parentTemplate = await findTemplateById(Number(parent));
            } catch (error) {
                return res.status(400).json({ error: "Something went wrong" });
            }

            if (!parentTemplate) {
                return res.status(404).json({ error: "Parent template not found" });
            }

            if (parentTemplate.visibility === false) {
                return res.status(403).json({ error: "Forbidden" });
            }
        }

        try {
            const verifyTags = await verifyOrCreateTags(tags);

            const data = <any> {
                title,
                description,
                tags: {
                    connect: verifyTags,
                },
                content,
                language,
                authorId: userId,
                parentId: parent ? Number(parent) : null,
            };

            const newTemplate = await createTemplate(data);

            return res.status(201).json(newTemplate);
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
