import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { TagComboboxNewTag } from '@/components/TagComboboxNewTag';
import { useAuth } from '@/context/AuthContext';
import api from '@/services/authService';
import { boolean } from 'zod';

interface Template {
    id: string;
    title: string;
    description: string | null;
}

const CreatePost: React.FC = () => {
    const [title, setTitle] = useState('');
    const [titleError, setTitleError] = useState<string | null>(null);
    const [descriptionError, setDescriptionError] = useState<string | null>(null);
    const [description, setDescription] = useState('');
    const [templates, setTemplates] = useState<Template[]>([]);
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [postTags, setPostTags] = useState<string[]>([]);
    const [query, setQuery] = useState('');
    const [page, setPage] = useState(1);
    const [hasNextPage, setHasNextPage] = useState(true);
    const [selectedTemplates, setSelectedTemplates] = useState<Set<string>>(new Set());
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

    useEffect(() => {
        fetchTemplates();
    }, [query, page, selectedTags]);

    const fetchTemplates = async () => {
        try {
            const response = await axios.get(`/api/template`, {
                params: { query, page, perPage: 10, tags: selectedTags.join(',') }
            });
            setTemplates(response.data.results);
            setHasNextPage(response.data.results.length === 10);
        } catch (error) {
            console.error("Error fetching templates:", error);
        }
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        let pass = true;

        if (title.length > 100) {
            setTitleError("Title cannot be more than 100 characters.");
            pass = false;
        }

        if (title.length === 0) {
            setTitleError("Title is required.");
            pass = false;
        }

        if (pass) {
            setTitleError('');
        }

        if (description.length === 0) {
            setDescriptionError("Description is required.");
            pass = false;
        } else {
            setDescriptionError("");
        }

        if (!pass) {
            return;
        }

        try {
            const temp = Array.from(selectedTemplates).map((id) => ({ id }));
            const ta = postTags.map((tag) => ({ name: tag }));
            const response = await api.post('/posts/auth', {
                title,
                description,
                templates: temp,
                tags: ta
            });
            router.push(`/posts/${response.data.id}`);
        } catch (error) {
            console.error("Error creating post:", error);
        }
    };

    const toggleTemplateSelection = (templateId: string) => {
        setSelectedTemplates((prevSelected) => {
            const updatedSelected = new Set(prevSelected);
            if (updatedSelected.has(templateId)) {
                updatedSelected.delete(templateId);
            } else {
                updatedSelected.add(templateId);
            }
            return updatedSelected;
        });
    };

    const handleNextPage = () => {
        if (hasNextPage) {
            setPage((prevPage) => prevPage + 1);
        }
    };

    const handlePreviousPage = () => {
        if (page > 1) {
            setPage((prevPage) => prevPage - 1);
        }
    };

    const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newTitle = e.target.value;
        setTitle(newTitle);
    };

    return (
        <div className="p-4 space-y-6 flex flex-col items-center justify-center">
            <Card className="w-full max-w-lg sm:max-w-xl md:max-w-2xl lg:max-w-6xl">
                <CardHeader>
                    <CardTitle>Create Post</CardTitle>
                    <CardDescription>Fill in the details below to create a new post.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
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
                            <label className={`block text-sm font-medium ${descriptionError ? 'text-red-600 font-bold' : ''}`}>Description</label>
                            <Textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                rows={8}
                            />
                            {descriptionError && <p className="text-red-600 text-sm font-medium mt-1">{descriptionError}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium">Tags</label>
                            <TagComboboxNewTag
                                selectedTags={postTags}
                                setSelectedTags={setPostTags}
                            />
                        </div>

                        <Button type="submit" variant="default">Create Post</Button>
                    </form>
                </CardContent>
            </Card>

            <Card  className="w-full max-w-lg sm:max-w-xl md:max-w-2xl lg:max-w-6xl">
                <CardHeader>
                    <CardTitle>Select Templates</CardTitle>
                    <CardDescription>Search and choose templates for your post.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="relative">
                        <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search />
                        </span>
                        <Input
                            type="text"
                            placeholder="Search templates"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            className="pl-10"  // Add padding-left to avoid overlapping with the icon
                        />
                    </div>

                    <div className="mt-4">
                        <label className="block text-sm font-medium mb-2">Filter by Tags</label>
                        <TagComboboxNewTag selectedTags={selectedTags} setSelectedTags={setSelectedTags} />
                    </div>

                    <div className="mt-4 space-y-4">
                        {templates.map((template) => (
                            <div key={template.id} className="flex items-center space-x-2">
                                <Checkbox
                                    checked={selectedTemplates.has(template.id)}
                                    onCheckedChange={() => toggleTemplateSelection(template.id)}
                                />
                                <div className="cursor-pointer" onClick={() => toggleTemplateSelection(template.id)}>
                                    <h3 className="text-sm font-medium">{template.title}</h3>
                                    <p className="text-xs text-gray-600">ID: {template.id}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="flex justify-between mt-4">
                        <Button onClick={handlePreviousPage} disabled={page === 1}>
                            <ChevronLeft />Previous
                        </Button>
                        <Button onClick={handleNextPage} disabled={!hasNextPage}>
                            Next<ChevronRight />
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default CreatePost;
