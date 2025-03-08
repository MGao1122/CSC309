import { PrismaClient, Prisma } from "@prisma/client";

const prisma = new PrismaClient();

export async function verifyTemplates(templates: { id: number }[]) {
    try {
        if (!templates || templates.length === 0) {
            return [];
        }

        let existingTemplates = await prisma.template.findMany({
            where: {
                id: { in: templates.map(template => template.id) },
            },
        });

        if (existingTemplates.length < templates.length) {
            throw new Error('Some templates do not exist');
        }
        
        return existingTemplates;
    } catch (error) {
        console.error(error);
        throw error;
    }   
}

export async function findTemplateById(id: number) {
    try {
        const template = await prisma.template.findUnique({
            where: { id: Number(id) },
            select: {
                id: true,
                title: true,
                description: true,
                content: true,
                language: true,
                parentTemplate: {
                    select: {
                        id: true,
                        title: true,
                    },
                },
                visibility: true,
                authorId: true,
            },
        });

        return template;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

export async function findTemplates(filters: object, skip: number, take: number) {
    try {
        const results = await prisma.template.findMany({
            where: filters,
            orderBy: {
                id: 'desc',
            },
            select: {
                id: true,
                title: true,
                description: true,
                language: true,
                parentTemplate: {
                    select: {
                        id: true,
                        title: true,
                    },
                },
                authorId: true,
                visibility: true,
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

export async function createTemplate(data: Prisma.TemplateCreateInput) {
    try {
        const newTemplate = await prisma.template.create({
            data: data,
            select: {
                id: true,
                title: true,
                description: true,
                language: true,
                parentTemplate: {
                    select: {
                        id: true,
                        title: true,
                    },
                },
                authorId: true,
            },
        });

        return newTemplate;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

export async function updateTemplate(id: number, data: object) {
    try {
        const updatedTemplate = await prisma.template.update({
            where: { id: Number(id) },
            data: data,
            select: {
                id: true,
                title: true,
                description: true,
                language: true,
                parentTemplate: {
                    select: {
                        id: true,
                        title: true,
                    },
                },
                authorId: true,
            },
        });

        return updatedTemplate;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

export async function deleteTemplate(id: number) {
    try {
        await prisma.template.delete({
            where: { id: Number(id) },
        });
    } catch (error) {
        console.error(error);
        throw error;
    }
}

export async function templatesCount(filters: object) {
    try {
        const count = await prisma.template.count({
            where: filters,
        });

        return count;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

export async function findTemplateChildren(id: number, skip: number, take: number) {
    try {
        const results = await prisma.template.findMany({
            where: { 
                parentId: Number(id),
                visibility: true,
            },
            select: {
                visibility: true,
                id: true,
                title: true,
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

export async function templateChildrenCount(id: number) {
    try {
        const count = await prisma.template.count({
            where: { 
                parentId: Number(id),
                visibility: true,
            },
        });

        return count;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

export async function findTemplatePosts(id: number, skip: number, take: number) {
    try {
        const results = await prisma.template.findUnique({
            where: { id: Number(id) },
            select: {
                blogPosts: {
                    where: { visibility: true },
                    select: {
                        id: true,
                        title: true,
                        description: true,
                        // language: true,
                        // parentTemplate: {
                        //     select: {
                        //         id: true,
                        //         title: true,
                        //     },
                        // },
                    },
                    skip,
                    take,
                },
                visibility: true
            },
        });
                
        return results;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

export async function templatePostsCount(id: number) {
    try {
        const count = await prisma.template.findUnique({
            where: { id: Number(id) },
            select: {
                blogPosts: {
                    where: { visibility: true },
                    select: {
                        id: true,
                    },
                },
            },
        });

        if (!count) return;

        return count.blogPosts.length;
    } catch (error) {
        console.error(error);
        throw error;
    }
}
