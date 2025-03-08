import { countChildren, findCommentsChildren } from '@/utils/comments';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { id, page = 1, perPage = 50, replies = 3 } = req.query;

    const skip = (Number(page) - 1) * Number(perPage);
    const take = Number(perPage);

    try {
        const count = await countChildren(Number(id));
        const totalPages = Math.ceil(count / Number(perPage));

        console.log('count', count);

        if (count === 0) {
            return res.status(200).json({ results: [], page, perPage, totalPages });
        }

        if (Number(page) > totalPages) {
            return res.status(404).json({ error: 'Page not found' });
        }

        const results = await findCommentsChildren(Number(id), skip, take, Number(replies));

        return res.status(200).json({ results, page, perPage, totalPages });
    } catch (error) {
        return res.status(400).json({ error: 'Something went wrong' });
    }
}