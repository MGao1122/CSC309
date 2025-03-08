import { verifyTokenMiddleware } from "@/utils/auth";
import { verifyOrCreateTags } from "@/utils/tags";
import { findTemplateById, updateTemplate, deleteTemplate } from "@/utils/templates";
import { NextApiRequest, NextApiResponse } from "next";

export const config = {
    api: {
        externalResolver: true,
    },
};

async function handler(req: NextApiRequest & { userinfo?: { userId: number; role?: string } }, res: NextApiResponse) {
    const { id } = req.query;
    const userId = req.userinfo?.userId;

    if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
    }

    if (req.method === "PUT") {  // update by id
        const { title, description, tags, content, language } = req.body;

        try {
            const template = await findTemplateById(Number(id));

            if (!template) {
                return res.status(404).json({ error: "Template not found" });
            }

            if (template.authorId !== userId || template.visibility === false) {
                return res.status(403).json({ error: "Forbidden" });
            }

            const verifyTags = await verifyOrCreateTags(tags);

            const data = {
                title,
                description,
                tags: {
                    set: verifyTags,
                },
                content,
                language,
            };

            const updatedTemplate = await updateTemplate(Number(id), data);

            return res.status(200).json(updatedTemplate);
        } catch (error) {
            return res.status(400).json({ error: "Something went wrong" });
        }
    } else if (req.method === "DELETE") {  // delete by id
        try {
            const template = await findTemplateById(Number(id));

            if (!template) {
                return res.status(404).json({ error: "Template not found" });
            }

            if (template.authorId !== userId) {
                return res.status(403).json({ error: "Forbidden" });
            }

            await deleteTemplate(Number(id));

            return res.status(204).end();
        } catch (error) {
            return res.status(400).json({ error: "Something went wrong" });
        }
    } else if (req.method === "GET") {  // get by id
        try {
            const template = await findTemplateById(Number(id));

            if (!template) {
                return res.status(404).json({ error: "Template not found" });
            }

            if (template.authorId !== userId && req.userinfo?.role !== "admin") {
                return res.status(403).json({ error: "Forbidden" });
            }

            return res.status(200).json(template);
        } catch (error) {
            return res.status(400).json({ error: "Something went wrong" });
        }
    } else {
        return res.status(405).json({ error: "Method not allowed" });
    }
}

export default function protectedRoute(req: NextApiRequest, res: NextApiResponse) {
    verifyTokenMiddleware(req, res, () => handler(req, res));
}
