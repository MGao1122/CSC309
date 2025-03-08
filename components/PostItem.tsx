// components/PostItem.tsx
import React from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from './ui/card'; // Assuming Card components are imported correctly
import { truncateDescription } from './utils';
import { Heart } from 'lucide-react';
import FrostedGlass from './FrostedGlass';

interface PostItemProps {
    id: number;
    title: string;
    description: string;
    layout?: 'list' | 'card'; // Add layout prop for flexibility
    rating: number; // Add rating prop
}

const PostItem: React.FC<PostItemProps> = ({ id, title, description, layout = 'card', rating }) => {
    return (
        <Link href={`/posts/${id}`} passHref>
            <FrostedGlass
                className={`h-[22rem] flex flex-col break-words overflow-hidden cursor-pointer hover:bg-white/60 dark:hover:bg-black/60 transition-colors duration-500 transition-ease-in-out`}
            >
                <CardHeader className=''>
                    <CardTitle className='max-h-[4.55rem] overflow-hidden break-words'>{title.slice(0, 100)}{title.length > 100 ? '...' : ''}</CardTitle>
                    <CardDescription>ID: {id}</CardDescription>
                </CardHeader>
                <CardContent className="relative h-full flex flex-col">
                    <p className="break-words overflow-hidden max-h-24">
                        {truncateDescription(description, 1000)}
                    </p>
                    {/* Add a container with absolute positioning */}
                    <div className="absolute bottom-4 right-6 flex items-center font-bold">
                        <Heart size={20} className="mr-1" fill={'#ff0000'} color="#ff0000" />{rating}
                    </div>
                </CardContent>
            </FrostedGlass>
        </Link>
    );
};



export default PostItem;
