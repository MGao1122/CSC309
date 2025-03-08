// TemplateItem.tsx
import React from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from './ui/card'; // Assuming Card components are in the same directory
import FrostedGlass from './FrostedGlass';

interface TemplateItemProps {
    id: number;
    title: string;
    description: string | null;
    language: string;
    forked: boolean;
}

const TemplateItem: React.FC<TemplateItemProps> = ({ id, title, description, language, forked }) => {
    return (
        <Link href={`/template/${id}`} passHref>
            <FrostedGlass className="h-96 flex flex-col cursor-pointer hover:bg-white/60 dark:hover:bg-black/60 transition-colors duration-500 transition-ease-in-out overflow-hidden">
                <CardHeader>
                    <CardTitle className="break-words overflow-hidden max-h-[4.55rem]">
                        {title.slice(0, 100)}{title.length > 100 ? '' : ''}
                    </CardTitle>
                    <CardDescription>ID: {id}</CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="mb-2 break-words overflow-hidden max-h-[7.5rem]">
                        {description ? `${description.slice(0, 200)}${description.length > 100 ? '' : ''}` : ''}
                    </p>
                    <p><strong>Language:</strong> {language.charAt(0).toUpperCase() + language.slice(1)}</p>
                    <p><strong>Forked:</strong> {forked ? "Yes" : "No"}</p>
                </CardContent>
            </FrostedGlass>

        </Link>
    );
};

export default TemplateItem;

