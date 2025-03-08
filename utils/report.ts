import { PrismaClient } from "@prisma/client";
import { report } from "process";

const prisma = new PrismaClient();

export async function reportTemplate(id: number, userId: number, content: string) {
    try {
        const report = await prisma.report.create({
            data: {
                templateId: id,
                authorId: userId,
                content: content,
            },
            select: {
                id: true,
                templateId: true,
                authorId: true,
            },
        });

        await prisma.template.update({
            where: {
                id: id
            },
            data: {
                reportCount: {
                    increment: 1
                }
            }
        });

        return report;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

export async function reportPost(id: number, userId: number, content: string) {
    try {
        const report = await prisma.report.create({
            data: {
                blogPostId: id,
                authorId: userId,
                content: content,
            },
            select: {
                id: true,
                blogPostId: true,
                authorId: true,
            },
        });

        await prisma.blogPost.update({
            where: {
                id: id
            },
            data: {
                reportCount: {
                    increment: 1
                }
            }
        });

        return report;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

export async function reportComment(id: number, userId: number, content: string) {
    try {
        const report = await prisma.report.create({
            data: {
                commentId: id,
                authorId: userId,
                content: content,
            },
            select: {
                id: true,
                commentId: true,
                authorId: true,
            },
        });

        await prisma.comment.update({
            where: {
                id: id
            },
            data: {
                reportCount: {
                    increment: 1
                }
            }
        });

        return report;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

export async function findCommentReports(skip: number, take: number, showHidden: boolean) {
    let where;

    if (!showHidden) {
        where = {
            NOT: { report: { none: {} } },
            visibility: true,
        }
    } else {
        where = {
            NOT: { report: { none: {} } },
        }
    }

    try {
        const results = await prisma.comment.findMany({
            where: where,
            orderBy: {
                reportCount: "desc",
            },
            select: {
                id: true,
                content: true,
                authorId: true,
                blogPostId: true,
                visibility: true,
                reportCount: true,
                report: {
                    select: {
                        id: true,
                    },
                    skip: 0,
                    take: 1,
                }
            },
        });

        return results;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

export async function findPostReports(skip: number, take: number, showHidden: boolean) {
    let where;

    if (!showHidden) {
        where = {
            NOT: { report: { none: {} } },
            visibility: true,
        }
    } else {
        where = {
            NOT: { report: { none: {} } },
        }
    }

    try {
        const results = await prisma.blogPost.findMany({
            where: where,
            orderBy: {
                reportCount: "desc",
            },
            select: {
                id: true,
                title: true,
                description: true,
                authorId: true,
                visibility: true,
                reportCount: true,
                report: {
                    select: {
                        id: true,
                    },
                    skip: 0,
                    take: 1,
                }
            },
            skip,
            take,
        });

        return results;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

export async function findTemplateReports(skip: number, take: number, showHidden: boolean) {
    let where;

    if (!showHidden) {
        where = {
            NOT: { report: { none: {} } },
            visibility: true,
        }
    } else {
        where = {
            NOT: { report: { none: {} } },
        }
    }

    try {
        const results = await prisma.template.findMany({
            where: where,
            orderBy: {
                reportCount: "desc",
            },
            select: {
                id: true,
                title: true,
                description: true,
                content: true,
                authorId: true,
                visibility: true,
                reportCount: true,
                report: {
                    select: {
                        id: true,
                    },
                    skip: 0,
                    take: 1,
                }
            },
            skip,
            take,
        });

        return results;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

export async function findCommentReportsCount(showHidden: boolean) {
    let where;
    
    if (!showHidden) {
        where = {
            NOT: { commentId: null },
            comment: {
                visibility: true,
            },
        }
    } else {
        where = {
            NOT: { commentId: null },
        }
    }


    try {
        const count = await prisma.report.count({
            where: where,
        });

        return count;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

export async function findPostReportsCount(showHidden: boolean) {
    let where;
    
    if (!showHidden) {
        where = {
            NOT: { blogPostId: null },
            blogPost: {
                visibility: true,
            },
        }
    } else {
        where = {
            NOT: { blogPostId: null },
        }
    }

    try {
        const count = await prisma.report.count({
            where: where,
        });

        return count;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

export async function findTemplateReportsCount(showHidden: boolean) {
    let where;
    
    if (!showHidden) {
        where = {
            NOT: { templateId: null },
            template: {
                visibility: true,
            },
        }
    } else {
        where = {
            NOT: { templateId: null },
        }
    }

    try {
        const count = await prisma.report.count({
            where: where,
        });

        return count;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

export async function findReportById(id: number) {
    try {
        const report = await prisma.report.findUnique({
            where: { id: Number(id) },
            select: {
                id: true,
                commentId: true,
                comment: {
                    select: {
                        id: true,
                        content: true,
                        authorId: true,
                        blogPostId: true,
                        visibility: true,
                        reportCount: true,
                    },
                },
                blogPostId: true,
                blogPost: {
                    select: {
                        id: true,
                        title: true,
                        description: true,
                        authorId: true,
                        visibility: true,
                        reportCount: true,
                    },
                },
                templateId: true,
                template: {
                    select: {
                        id: true,
                        title: true,
                        description: true,
                        content: true,
                        authorId: true,
                        visibility: true,
                        reportCount: true,
                    },
                },
                authorId: true,
                content: true,
            },
        });

        return report;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

export async function updateTemplateVisibility(id: number, visibility: boolean) {
    try {
        await prisma.template.update({
            where: { id: Number(id) },
            data: { visibility: visibility },
        });
    } catch (error) {
        console.error(error);
        throw error;
    }
}

export async function updateCommentVisibility(id: number, visibility: boolean) {
    try {
        await prisma.comment.update({
            where: { id: Number(id) },
            data: { visibility: visibility },
        });
    } catch (error) {
        console.error(error);
        throw error;
    }
}

export async function updatePostVisibility(id: number, visibility: boolean) {
    try {
        await prisma.blogPost.update({
            where: { id: Number(id) },
            data: { visibility: visibility },
        });
    } catch (error) {
        console.error(error);
        throw error;
    }
}
