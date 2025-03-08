import { PrismaClient, Prisma } from "@prisma/client";

export const prisma = new PrismaClient();

export async function findPosts(filters: object, skip: number, take: number) {
    try {
        const results = await prisma.blogPost.findMany({
            where: filters,
            orderBy: {
                rating: "desc",
            },
            select: {
                id: true,
                title: true,
                description: true,
                authorId: true,
                visibility: true,
                rating: true,
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

export async function postsCount(filters: object) {
    try {
        const count = await prisma.blogPost.count({
            where: filters,
        });

        return count;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

export async function createPost(data: Prisma.BlogPostCreateInput) {
    try {
        const newPost = await prisma.blogPost.create({
            data: data,
            select: {
                id: true,
                title: true,
                authorId: true,
            },
        });

        return newPost;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

export async function findPostsById(id: number) {
    try {
        const post = await prisma.blogPost.findUnique({
            where: { id: Number(id) },
            select: {
                id: true,
                title: true,
                description: true,
                authorId: true,
                visibility: true,
                rating: true,
            },
        });

        return post;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

export async function updatePost(id: number, data: object) {
    try {
        const updatedPost = await prisma.blogPost.update({
            where: { id: Number(id) },
            data: data,
            select: {
                id: true,
                title: true,
                authorId: true,
                visibility: true,
            },
        });

        return updatedPost;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

export async function deletePost(id: number) {
    try {
        await prisma.blogPost.update({
            where: { id: Number(id) },
            data: {
                templates: {
                    set: [],
                },
                tags: {
                    set: [],
                },
            },
        });
        await prisma.blogPost.delete({
            where: { id: Number(id) },
        });
    } catch (error) {
        console.error(error);
        throw error;
    }
}

export async function upvotePost(id: number, userId: number) {
    try {
        let rating;
        const post = await prisma.blogPost.findUnique({
            where: { id: Number(id) },
            select: {
                id: true,
                upUser: {
                    select: {
                        id: true,
                    },
                },
                downUser: {
                    select: {
                        id: true,
                    },
                },
                rating: true,
            },
        });

        if (!post) return;

        rating = post.rating;

        const upvoted = post.upUser.some((vote) => vote.id === userId);
        const downvoted = post.downUser.some((vote) => vote.id === userId);

        if (downvoted) {
            await prisma.blogPost.update({
                where: { id: Number(id) },
                data: {
                    downUser: {
                        disconnect: { id: userId },
                    },
                    upUser: {
                        connect: { id: userId },
                    },
                    rating: {
                        increment: 2,
                    },
                },
            });
            rating += 2;
        } else if (!upvoted) {
            await prisma.blogPost.update({
                where: { id: Number(id) },
                data: {
                    upUser: {
                        connect: { id: userId },
                    },
                    rating: {
                        increment: 1,
                    },
                },
            });
            rating += 1;
        }

        return rating;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

export async function downvotePost(id: number, userId: number) {
    try {
        let rating;
        const post = await prisma.blogPost.findUnique({
            where: { id: Number(id) },
            select: {
                id: true,
                upUser: {
                    select: {
                        id: true,
                    },
                },
                downUser: {
                    select: {
                        id: true,
                    },
                },
                rating: true,
            },
        });

        if (!post) return;

        rating = post.rating;

        const upvoted = post.upUser.some((vote) => vote.id === userId);
        const downvoted = post.downUser.some((vote) => vote.id === userId);

        if (upvoted) {
            await prisma.blogPost.update({
                where: { id: Number(id) },
                data: {
                    upUser: {
                        disconnect: { id: userId },
                    },
                    downUser: {
                        connect: { id: userId },
                    },
                    rating: {
                        decrement: 2,
                    },
                },
            });
            rating -= 2;
        } else if (!downvoted) {
            await prisma.blogPost.update({
                where: { id: Number(id) },
                data: {
                    downUser: {
                        connect: { id: userId },
                    },
                    rating: {
                        decrement: 1,
                    },
                },
            });
            rating -= 1;
        }

        return rating;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

export async function removeVotePost(id: number, userId: number) {
    try {
        let rating = 0;
        const post = await prisma.blogPost.findUnique({
            where: { id: Number(id) },
            select: {
                id: true,
                upUser: {
                    select: {
                        id: true,
                    },
                },
                downUser: {
                    select: {
                        id: true,
                    },
                },
                rating: true,
            },
        });

        if (!post) return;

        rating = post.rating;

        const upvoted = post.upUser.some((vote) => vote.id === userId);
        const downvoted = post.downUser.some((vote) => vote.id === userId);

        if (upvoted) {
            await prisma.blogPost.update({
                where: { id: Number(id) },
                data: {
                    upUser: {
                        disconnect: { id: userId },
                    },
                    rating: {
                        decrement: 1,
                    },
                },
            });
            rating -= 1;
        } else if (downvoted) {
            await prisma.blogPost.update({
                where: { id: Number(id) },
                data: {
                    downUser: {
                        disconnect: { id: userId },
                    },
                    rating: {
                        increment: 1,
                    },
                },
            });
            rating += 1;
        }

        return rating;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

export async function postTemplatesCount(id: number) {
    try {
        const count = await prisma.blogPost.findUnique({
            where: { id: Number(id) },
            select: {
                templates: {
                    where: { visibility: true },
                    select: {
                        id: true,
                    },
                },
            },
        });

        if (!count) return;

        return count.templates.length;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

export async function findPostTemplates(id: number, skip: number, take: number) {
    try {
        const results = await prisma.blogPost.findUnique({
            where: { id: Number(id) },
            select: {
                templates: {
                    where: { visibility: true },
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
