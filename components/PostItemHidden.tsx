// components/PostItem.tsx
import React from 'react';
import Link from 'next/link';
import { TriangleAlert } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card'; // Assuming Card components are imported correctly
import { truncateDescription } from './utils';

interface PostItemProps {
    id: number;
    title: string;
    description: string;
    layout?: 'list' | 'card'; // Add layout prop for flexibility
}

const PostItem: React.FC<PostItemProps> = ({ id, title, description, layout = 'card' }) => {
    return (
        <Link href={`/posts/auth/${id}`} passHref>
            <Card
                className={`h-72 flex flex-col break-words overflow-hidden cursor-pointer hover:bg-gray-100 transition dark:bg-gray-900 bg-gray-200 dark:hover:bg-gray-800`}
            >
                <CardHeader>
                    <CardTitle>{title.slice(0, 30)}{title.length > 30 ? '...' : ''}</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className='break-words overflow-hidden'>
                        {truncateDescription(description, 100)}
                    </p>
                    <p className='text-red-500 flex items-center font-bold'>
                        <TriangleAlert className="mr-2" />Restricted
                    </p>

                </CardContent>
            </Card>
        </Link>
    );
};

export default PostItem;