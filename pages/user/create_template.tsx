import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { TagComboboxNewTag } from "@/components/TagComboboxNewTag";
import api from '@/services/authService';
import { useAuth } from '@/context/AuthContext';

export function CreateTemplate() {
    const [title, setTitle] = useState<string>('');
    const [titleError, setTitleError] = useState<string | null>(null);
    const [description, setDescription] = useState<string>('');
    const [tags, setTags] = useState<string[]>([]);

    const router = useRouter();

    const { user, loading } = useAuth();

    useEffect(() => {
        if (!loading && !user) {
            router.push('/login'); // Redirect only after loading is complete
        }
    }, [loading, user, router]);

    if (loading) {
        return <p>Loading...</p>;
    }

    const handleCreateTemplate = async (event: React.FormEvent) => {
        event.preventDefault();

        if (title.length > 100) {
            setTitleError("Title cannot be more than 100 characters.");
            return;
        }

        if (title.length === 0) {
            setTitleError("Title is required.");
            return;
        }

        const formattedTags = tags.map(tag => ({ name: tag }));

        const payload = {
            title,
            description,
            tags: formattedTags,
            content: "print('Hello, World!')",
            language: "python"
        };

        try {
            const response = await api.post('/template/auth', payload);
            router.push(`/template/${response.data.id}`);
        } catch (error) {
            console.error("Error creating template:", error);
        }
    };

    const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newTitle = e.target.value;
        setTitle(newTitle);

        if (newTitle.length > 100) {
            setTitleError("Title cannot be more than 100 characters.");
        } else {
            setTitleError(null);
        }
    };

    return (
        <div className="p-4 space-y-6 flex items-center justify-center">
            <Card className="w-full max-w-lg sm:max-w-xl md:max-w-2xl lg:max-w-6xl">
                <CardHeader>
                    <CardTitle>Create Template</CardTitle>
                    <CardDescription>Fill in the details below to create a new template.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleCreateTemplate} className="space-y-4">
                        <div>
                            <label className={`block text-md font-medium ${titleError ? 'text-red-600 font-bold' : ''}`}>Title</label>
                            <Input
                                className='w-full max-w-md sm:max-w-md md:max-w-lg lg:max-w-xl'
                                type="text"
                                value={title}
                                onChange={handleTitleChange}
                            />
                            {titleError && <p className="text-red-600 text-sm font-medium mt-1">{titleError}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium">Description</label>
                            <Textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                rows={12}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium">Tags</label>
                            <TagComboboxNewTag
                                selectedTags={tags}
                                setSelectedTags={setTags}
                            />
                        </div>

                        <Button type="submit" variant="default" disabled={!!titleError}>
                            Create Template
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}

export default CreateTemplate;
