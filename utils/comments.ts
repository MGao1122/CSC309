import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface CommentWithChildren {
    id: number;
    content: string;
    authorId: number;
    blogPostId: number | null;
    rating: number;
    children: { id: number; content: string }[];
    childrenCount?: number;
}


export async function createComment(id: number, content: string, userId: number, parentId: number | null = null) {
    try {
        const newComment = await prisma.comment.create({
            data: {
                content: content,
                authorId: userId,
                blogPostId: id,
                parentId: Number(parentId) || null,
            },
            select: {
                id: true,
                content: true,
                authorId: true,
                blogPostId: true,
            },
        });

        return newComment;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

export async function commentsCount(id: number) {
    try {
        const count = await prisma.comment.count({
            where: {
                blogPostId: Number(id),
                visibility: true,
                parentId: null,
            },
        });

        return count;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

export async function findComments(id: number, skip: number, take: number, replies: number) {
    try {
        interface Comment {
            id: number;
            content: string;
            authorId: number;
            rating: number;
            childrenCount: number;
        }

        const results = <Comment[]> await prisma.comment.findMany({
            where: {
                blogPostId: Number(id),
                visibility: true,
                parentId: null,
            },
            orderBy: {
                rating: "desc",
            },
            select: {
                id: true,
                content: true,
                authorId: true,
                rating: true,
                
            },
            skip,
            take,
        });

        for (let i = 0; i < results.length; i++) {
            const count = await countChildren(results[i].id);
            results[i].childrenCount = count;
        }

        return results;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

export async function countChildren(parentId: number) {
    try {
        const count = await prisma.comment.count({
            where: {
                parentId: Number(parentId),
                visibility: true,
            },
        });

        return count;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

export async function findCommentsChildren(id: number, skip: number, take: number, replies: number): Promise<CommentWithChildren[]> {
    try {
        const results = await prisma.comment.findMany({
            where: {
                parentId: Number(id),
                visibility: true,
            },
            orderBy: {
                rating: "desc",
            },
            select: {
                id: true,
                content: true,
                authorId: true,
                blogPostId: true,
                children: {
                    where: {
                        visibility: true,
                    },
                    select: {
                        id: true,
                        content: true,
                    },
                    skip: 0,
                    take: Number(replies),
                },
                rating: true,
            },
            skip,
            take,
        });

        const enrichedResults: CommentWithChildren[] = [];
        for (let i = 0; i < results.length; i++) {
            const count = await countChildren(results[i].id);
            enrichedResults.push({ ...results[i], childrenCount: count });
        }

        return enrichedResults;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

export async function findCommentById(id: number) {
    try {
        const result = await prisma.comment.findUnique({
            where: { id: Number(id) },
            select: {
                id: true,
                content: true,
                authorId: true,
                blogPostId: true,
                visibility: true,
                rating: true,
            },
        });

        return result;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

export async function deleteComment(id: number) {
    try {
        await prisma.comment.delete({
            where: { id: Number(id) },
        });
    } catch (error) {
        console.error(error);
        throw error;
    }
}

export async function upvoteComment(id: number, userId: number) {
    try {
        const comment = await prisma.comment.findUnique({
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

        if (!comment) return;

        let rating = comment.rating;

        const upvoted = comment.upUser.some((vote) => vote.id === userId);
        const downvoted = comment.downUser.some((vote) => vote.id === userId);

        if (downvoted) {
            await prisma.comment.update({
                where: { id: Number(id) },
                data: {
                    rating: {
                        increment: 2,
                    },
                    upUser: {
                        connect: { id: userId },
                    },
                    downUser: {
                        disconnect: { id: userId },
                    },
                },
            });
            rating += 2;
        } else if (!upvoted) {
            await prisma.comment.update({
                where: { id: Number(id) },
                data: {
                    rating: {
                        increment: 1
                    },
                    upUser: {
                        connect: { id: userId },
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

export async function downvoteComment(id: number, userId: number) {
    try {
        const comment = await prisma.comment.findUnique({
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

        if (!comment) return;

        let rating = comment.rating;

        const upvoted = comment.upUser.some((vote) => vote.id === userId);
        const downvoted = comment.downUser.some((vote) => vote.id === userId);

        if (upvoted) {
            await prisma.comment.update({
                where: { id: Number(id) },
                data: {
                    rating: {
                        decrement: 2,
                    },
                    downUser: {
                        connect: { id: userId },
                    },
                    upUser: {
                        disconnect: { id: userId },
                    },
                },
            });
            rating -= 2;
        } else if (!downvoted) {
            await prisma.comment.update({
                where: { id: Number(id) },
                data: {
                    rating: {
                        decrement: 1,
                    },
                    downUser: {
                        connect: { id: userId },
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

export async function removeVoteComment(id: number, userId: number) {
    try {
        const comment = await prisma.comment.findUnique({
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

        if (!comment) return;

        let rating = comment.rating;

        const upvoted = comment.upUser.some((vote) => vote.id === userId);
        const downvoted = comment.downUser.some((vote) => vote.id === userId);

        if (upvoted) {
            await prisma.comment.update({
                where: { id: Number(id) },
                data: {
                    rating: {
                        decrement: 1,
                    },
                    upUser: {
                        disconnect: { id: userId },
                    },
                },
            });
            rating -= 1;
        } else if (downvoted) {
            await prisma.comment.update({
                where: { id: Number(id) },
                data: {
                    rating: {
                        increment: 1,
                    },
                    downUser: {
                        disconnect: { id: userId },
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
