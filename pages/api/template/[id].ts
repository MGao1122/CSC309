import { NextApiRequest, NextApiResponse } from "next";
import { findTemplateById } from "@/utils/templates";

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

export default async function handler(req: CustomNextApiRequest, res: NextApiResponse) {
    if (req.method !== "GET") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    const { id } = req.query;

    try {
        const template = await findTemplateById(Number(id));

        if (!template) {
            return res.status(404).json({ error: "Template not found" });
        }

        if (template.visibility === false) {
            return res.status(403).json({ error: "Forbidden" });
        }

        return res.status(200).json(template);
    } catch (error) {
        return res.status(400).json({ error: "Something went wrong" });
    }
}
