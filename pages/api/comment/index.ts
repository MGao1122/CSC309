import { commentsCount, findComments } from '@/utils/comments';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'GET') {
        const { postId, page = 1, perPage = 50, replies = 3 } = req.query;

        if (!postId) {
            return res.status(400).json({ error: 'Post ID is missing' });
        }

        const skip = (Number(page) - 1) * Number(perPage);
        const take = Number(perPage);

        try {
            const count = await commentsCount(Number(postId));
            const totalPages = Math.ceil(count / Number(perPage));

            if (count === 0) {
                return res.status(200).json({ results: [], page, perPage, totalPages });
            }

            if (Number(page) > totalPages) {
                return res.status(404).json({ error: 'Page not found' });
            }

            const results = await findComments(Number(postId), skip, take, Number(replies));

            return res.status(200).json({ results, page, perPage, totalPages, replies });
        } catch (error) {
            return res.status(400).json({ error: 'Something went wrong' });
        }
    } else {
        return res.status(405).json({ error: 'Method not allowed' });
    }
}
