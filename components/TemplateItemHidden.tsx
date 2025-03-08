// TemplateItem.tsx
import React from 'react';
import Link from 'next/link';
import { TriangleAlert } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from './ui/card'; // Assuming Card components are in the same directory
import FrostedGlass from './FrostedGlass';

interface TemplateItemProps {
    id: number;
    title: string;
    description: string | null;
    language: string;
    forked: boolean;
}

const TemplateItemHidden: React.FC<TemplateItemProps> = ({ id, title, description, language, forked }) => {
    return (
        <Link href={`/template/auth/${id}`} passHref>
            <FrostedGlass className="h-96 flex flex-col cursor-pointer hover:bg-white/60 dark:hover:bg-black/60 transition-colors duration-500 transition-ease-in-out overflow-hidden">
                <CardHeader className='pb-3'>
                    <CardTitle className='overflow-hidden break-words overflow-hidden max-h-12'>{title.slice(0, 40)}{title.length > 40 ? '...' : ''}</CardTitle>
                    <CardDescription>ID: {id}</CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="mb-1 break-words overflow-hidden max-h-[7.5rem]">{description ? `${description.slice(0, 200)}${description.length > 200 ? '...' : ''}` : ''}</p>
                    <p><strong>Language:</strong> {language.charAt(0).toUpperCase() + language.slice(1)}</p>
                    <p><strong>Forked:</strong> {forked ? "Yes" : "No"}</p>
                    <p className='text-red-500 flex items-center font-bold'>
                        <TriangleAlert className="mr-2" />Restricted
                    </p>
                </CardContent>
            </FrostedGlass>
        </Link>
    );
};

export default TemplateItemHidden;

