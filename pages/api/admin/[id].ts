import { verifyTokenMiddleware } from "@/utils/auth";
import { findReportById, updateTemplateVisibility, updateCommentVisibility, updatePostVisibility } from "@/utils/report";
import { NextApiRequest, NextApiResponse } from "next";

export const config = {
    api: {
        externalResolver: true,
    },
};

async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === "GET") {
        const { id } = req.query;

        if (!id || isNaN(Number(id))) {
            return res.status(400).json({ error: "Invalid report ID" });
        }

        try {

            const report = await findReportById(Number(id));

            if (!report) {
                return res.status(404).json({ error: "Report not found" });
            }

            return res.status(200).json(report);
        } catch (error) {
            return res.status(400).json({ error: "Something went wrong" });
        }
    } else if (req.method === "PUT") {
        const { id } = req.query;
        const { templatedVisibility = false, commentVisibility = false, postVisibility = false } = req.body;

        if (!id || isNaN(Number(id))) {
            return res.status(400).json({ error: "Invalid report ID" });
        }

        try {
            const report = await findReportById(Number(id));

            if (!report) {
                return res.status(404).json({ error: "Report not found" });
            }

            if (report.templateId && report.template && report.template.visibility === true && templatedVisibility === false) {
                await updateTemplateVisibility(report.templateId, false);
                return res.status(200).json({ message: "Template visibility updated" });
            }

            if (report.commentId && report.comment && report.comment.visibility === true && commentVisibility === false) {
                await updateCommentVisibility(report.commentId, false);
                return res.status(200).json({ message: "Comment visibility updated" });
            }

            if (report.blogPostId && report.blogPost && report.blogPost.visibility === true && postVisibility === false) {
                await updatePostVisibility(report.blogPostId, false);
                return res.status(200).json({ message: "Post visibility updated" });
            }

            if (report.templateId && report.template && report.template.visibility === false && templatedVisibility === true) {
                await updateTemplateVisibility(report.templateId, true);
                return res.status(200).json({ message: "Template visibility updated" });
            }

            if (report.commentId && report.comment &&  report.comment.visibility === false && commentVisibility === true) {
                await updateCommentVisibility(report.commentId, true);
                return res.status(200).json({ message: "Comment visibility updated" });
            }

            if (report.blogPostId && report.blogPost && report.blogPost.visibility === false && postVisibility === true) {
                await updatePostVisibility(report.blogPostId, true);
                return res.status(200).json({ message: "Post visibility updated" });
            }

            return res.status(200).json({ message: "No changes made" });
        } catch (error) {
            return res.status(400).json({ error: "Something went wrong" });
        }
    } else {
        return res.status(405).json({ error: "Method not allowed" });
    }
}

export default function protectedRoute(req: NextApiRequest, res: NextApiResponse) {
    verifyTokenMiddleware(req, res, () => handler(req, res), "admin");
}
