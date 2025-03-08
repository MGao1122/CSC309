import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function verifyOrCreateTags(tags: { name: string }[]) {
    try {
        if (!tags || tags.length === 0) {
            return [];
        }

        let existingTags = await prisma.tag.findMany({
            where: {
                name: { in: tags.map(tag => tag.name) },
            },
        });

        const existingTagNames = existingTags.map(tag => tag.name);
        let newTags = tags.filter(tag => !existingTagNames.includes(tag.name));

        // remove duplicates
        newTags = newTags.filter((tag, index, self) => self.findIndex(t => t.name === tag.name) === index);

        if (newTags.length > 0) {
            await prisma.tag.createMany({
                data: newTags,
            });

            const createdTags = await prisma.tag.findMany({
                where: {
                    name: { in: newTags.map(tag => tag.name) },
                },
            });

            existingTags = existingTags.concat(createdTags);
        }

        return existingTags;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

export async function getTags(skip: number, take: number, query: string) {
    try {
        const tags = await prisma.tag.findMany({
            orderBy: {
                name: 'asc',
            },
            select: {
                name: true,
            },
            where: {
                name: { contains: query },
            },
            skip,
            take,
        });

        return tags;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

export async function tagsCount(query: string) {
    try {
        const count = await prisma.tag.count({
            where: {
                name: { contains: query },    
            },
        });

        return count;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

export async function findTemplateTags(id: number, skip: number, take: number) {
    try {
        const results = await prisma.template.findUnique({
            where: { id: Number(id) },
            select: {
                tags: {
                    orderBy: {
                        name: 'asc',
                    },
                    select: {
                        name: true,
                    },
                    skip,
                    take,
                },
                visibility: true,
            },
        });

        return results;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

export async function templateTagsCount(id: number) {
    try {
        const count = await prisma.template.findUnique({
            where: { id: Number(id) },
            select: {
                tags: {
                    select: {
                        name: true,
                    },
                },
            },
        });

        if (!count) return;

        return count.tags.length;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

export async function findPostTags(id: number, skip: number, take: number) {
    try {
        const results = await prisma.blogPost.findUnique({
            where: { id: Number(id) },
            select: {
                tags: {
                    orderBy: {
                        name: 'asc',
                    },
                    select: {
                        name: true,
                    },
                    skip,
                    take,
                },
            },
        });

        return results;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

export async function postTagsCount(id: number) {
    try {
        const count = await prisma.blogPost.findUnique({
            where: { id: Number(id) },
            select: {
                tags: {
                    select: {
                        name: true,
                    },
                },
            },
        });

        if (!count) return;

        return count.tags.length;
    } catch (error) {
        console.error(error);
        throw error;
    }
}
