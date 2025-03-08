// pages/posts/[id].tsx
import React, { use, useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import Tag from '@/components/Tag';
import TemplateItem from '@/components/TemplateItem';
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationPrevious,
    PaginationNext,
    PaginationEllipsis
} from '@/components/ui/pagination';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alertdialog"
import api from '@/services/authService';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import User from '@/components/User';
import { ReportButton } from '@/components/ReportButton';
import { Textarea } from '@/components/ui/textarea';
import { Toggle } from '@/components/ui/toggle';
import { set } from 'react-hook-form';
import CommentHolder from '@/components/CommentHolder';
import axios from 'axios';
import { Heart, HeartOff, Trash2 } from 'lucide-react';
import { TagComboboxNewTag } from '@/components/TagComboboxNewTag';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { ChevronLeft, ChevronRight, Save } from 'lucide-react';
import { Title } from '@radix-ui/react-dialog';


interface Post {
    id: number;
    title: string;
    description: string;
    authorId: number;
    visibility: boolean;
    rating: number;
}

interface Template {
    id: number;
    title: string;
    description: string | null;
    language: string;
    parentTemplate: Template | null;
    authorId: number;
}

interface Template2 {
    id: number;
    title: string;
    description: string | null;
}

interface UserVote {
    upvote: boolean;
    downvote: boolean;
}

const PostDetail: React.FC = () => {
    const router = useRouter();
    const { id } = router.query;
    const [post, setPost] = useState<Post | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [titleError, setTitleError] = useState<string | null>(null);
    const [descriptionError, setDescriptionError] = useState<string | null>(null);
    const [tags, setTags] = useState<string[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const tagsPerPage = 5;
    const [totalPages, setTotalPages] = useState(1);
    const [input, setInput] = useState<string>('');
    const [templates, setTemplates] = useState<Template[]>([]);
    const [loadingTemplates, setLoadingTemplates] = useState(true);
    const [TemplatePage, setTemplatePage] = useState(1);
    const templatesPerPage = 4;
    const [totalTemplatePages, setTotalTemplatePages] = useState(1);
    const [showComment, setShowComment] = useState(false);
    const [templateSelectLoading, setTemplateSelectLoading] = useState(false);

    const [postTags, setPostTags] = useState<string[]>([]);
    const { user } = useAuth();

    const [isUpvoted, setIsUpvoted] = useState(false);
    const [isDownvoted, setIsDownvoted] = useState(false);

    const [countdown, setCountdown] = useState(5);
    const [selectedTemplates, setSelectedTemplates] = useState<Set<number>>(new Set());

    const [newTitle, setNewTitle] = useState('');
    const [newDescription, setNewDescription] = useState('');
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const handleTitle = async (value: string) => {
        setNewTitle(value);
    }

    const handleDescription = async (value: string) => {
        setNewDescription(value);
    }

    const fetchUserVote = async () => {
        try {
            const response = await api.get(`/find/post/vote/${id}`);
            if (response.data) {
                console.log(response.data);
                setIsUpvoted(response.data.upvoted);
                setIsDownvoted(response.data.downvoted);
            }
        } catch (error) {
            console.error('Error fetching user vote:', error);
        }
    }

    const fetchPostTags = async () => {
        if (currentPage >= totalPages) {
            setPostTags(tags);
        }

        let page = currentPage + 1;
        let allTags = [...tags];

        try {
            while (page < totalPages) {
                const response = await fetch(`/api/find/post/tags/${id}?page=${page}&perPage=${tagsPerPage}`);
                const data = await response.json();
                if (data.results && data.results.tags) {
                    allTags = [...allTags, ...data.results.tags.map((tag: { name: string }) => tag.name)];
                    page++;
                }
            }
        } catch (error) {
            console.error('Error fetching tags:', error);
        } finally {
            setPostTags(allTags);

            setNewTitle(post?.title || '');
            setNewDescription(post?.description || '');
        }
    }

    const fetchAllTemplates = async () => {
        if (TemplatePage >= totalTemplatePages) {
            setSelectedTemplates(new Set(templates.map((temp) => temp.id)));
        }

        let page = TemplatePage + 1;
        let allTemplates = [...templates];
        console.log(allTemplates);
        try {
            while (page <= totalTemplatePages) {
                console.log(totalTemplatePages, page);
                const response = await fetch(`/api/find/post/template/${id}?page=${page}&perPage=${templatesPerPage}`);
                const data = await response.json();
                console.log(data);
                if (data.results && data.results.templates) {
                    allTemplates = [...allTemplates, ...data.results.templates];
                    page++;
                }
            }
            console.log(allTemplates);
        } catch (error) {
            console.error('Error fetching templates:', error);
        } finally {
            setSelectedTemplates(new Set(allTemplates.map((temp) => temp.id)));
        }
    }

    const fetchTemplates = async (page: number) => {
        try {
            const response = await fetch(`/api/find/post/template/${id}?page=${page}&perPage=${templatesPerPage}`);
            const data = await response.json();
            if (data.results && data.results.templates) {
                setTemplates(data.results.templates);
                // for each template, add the id to the selectedTemplates set
                setTotalTemplatePages(data.totalPages); // Set total pages from the response
                setTemplatePage(page);
            }
            setLoadingTemplates(false);
        } catch (error) {
            console.error('Error fetching templates:', error);
        }
    }


    const fetchTags = async (page: number) => {
        try {
            const response = await fetch(`/api/find/post/tags/${id}?page=${page}&perPage=${tagsPerPage}`);
            const data = await response.json();
            if (data.results && data.results.tags) {
                setTags((prevTags) => [...prevTags, ...data.results.tags.map((tag: { name: string }) => tag.name)]);
                setTotalPages(data.totalPages); // Set total pages from the response
            }
        } catch (error) {
            console.error('Error fetching tags:', error);
        }
    };

    const savePost = async () => {
        let pass = true;

        if (newTitle.length === 0) {
            setTitleError("Title is required.");
            pass = false;
        }

        if (pass) {
            setTitleError('');
        }

        if (newDescription.length === 0) {
            setDescriptionError("Description is required.");
            pass = false;
        } else {
            setDescriptionError("");
        }

        if (!pass) {
            return;
        }

        setTitleError("");

        if (newDescription.length === 0) {
            setDescriptionError("Description is required.");
            return;
        }

        setDescriptionError("");

        try {
            await api.put(`/posts/auth/${id}`, {
                title: newTitle,
                description: newDescription,
                tags: postTags.map((name) => ({ name })),
                templates: Array.from(selectedTemplates).map((id) => ({ id })),
            });
            if (post) {
                post.title = newTitle;
                post.description = newDescription;
                setPost(post);
            }
            setTags(postTags);
            fetchTemplates(1);

        } catch (error) {
            console.error('Error updating post:', error);
        } finally {
            setIsDialogOpen(false);
        }
    }

    useEffect(() => {
        if (id) {
            const fetchPost = async () => {
                try {
                    const response = await axios.get(`http://localhost:3000/api/posts/${id}`);
                    if (response.data) {
                        setPost(response.data);
                    } else {
                        setError(response.data.error || "Post not found");
                    }
                    fetchTemplates(1);
                    fetchTags(1);
                    setNewTitle(post?.title || '');
                    setNewDescription(post?.description || '');
                    if (user) {
                        fetchUserVote();
                    }
                } catch (error) {
                    console.error('Error fetching post:', error);
                    setError("An error occurred while fetching the post.");
                } finally {
                    setLoading(false);
                }
            };

            fetchPost();
            setShowComment(true);
        }
    }, [id]);

    useEffect(() => {
        if (error) {
            const interval = setInterval(() => {
                setCountdown(prev => prev - 1);
            }, 1000);

            if (countdown <= 0) {
                clearInterval(interval);
                router.push('/');
            }

            return () => clearInterval(interval);
        }
    }, [error, countdown, router]);


    if (!post && !error) {
        return <p>Loading...</p>;
    }


    if (error) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="bg-red-500 text-white p-6 rounded-md shadow-md text-center min-w-[50%]">
                    <p className="text-xl font-semibold">Error</p>
                    <p className="mt-2">{error}</p>
                    <p className="mt-4 text-sm">
                        Redirecting to the home page in {countdown} seconds...
                    </p>
                </div>
            </div>
        );
    }

    interface RatingPayload {
        upvote: boolean;
        downvote: boolean;
    }

    const changeRating = async (upvote: boolean, downvote: boolean): Promise<void> => {
        let payload: RatingPayload;
        if (upvote) {
            payload = { upvote: true, downvote: false };
        } else if (downvote) {
            payload = { upvote: false, downvote: true };
        } else {
            payload = { upvote: false, downvote: false };
        }
        try {
            const response = await api.post(`/posts/auth/${id}`, payload);

            if (upvote) {
                setIsUpvoted(true);
                setIsDownvoted(false);
            } else if (downvote) {
                setIsUpvoted(false);
                setIsDownvoted(true);
            } else {
                setIsUpvoted(false);
                setIsDownvoted(false);
            }

            if (post) {
                post.rating = response.data.rating;
                setPost(post);
            }
        } catch (error) {
            console.error('Error changing rating:', error);
        }
    };


    const handleShowMore = () => {
        const nextPage = currentPage + 1;
        setCurrentPage(nextPage);
        fetchTags(nextPage); // Fetch tags for the next page only on button click
    };

    if (loading) return <p>Loading post...</p>;

    const handleDelete = async () => {
        try {
            await api.delete(`http://localhost:3000/api/posts/auth/${post?.id}`);
            router.push('/');
        } catch (error) {
            console.error('Error deleting template:', error);
        }
    }

    const handleInputChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        setInput(event.target.value);
    };

    const sendComment = async () => {
        if (input === "") return;
        setShowComment(false);
        try {
            await api.post(`/comment/auth`, { postId: post?.id, content: input });
        } catch (error) {
            setError("Error");
        }
        setInput("");
        setShowComment(true);
    }

    const toggleTemplateSelection = (templateId: number) => {
        setSelectedTemplates((prevSelected) => {
            const updatedSelected = new Set(prevSelected);
            if (updatedSelected.has(templateId)) {
                updatedSelected.delete(templateId);
            } else {
                updatedSelected.add(templateId);
            }
            return updatedSelected;
        });
        console.log(selectedTemplates);
    };

    return (
        <div className='container px-2 py-2'>
            <Card className="container mx-auto p-4 max-w-screen">
                <h1 className="text-4xl font-semibold m-4 mb-2 ml-2">{post?.title}</h1>
                <div className="mb-4 ml-2 mr-4">
                    {tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                            {tags.map((tag, index) => (
                                <Tag key={index} name={tag} />
                            ))}

                            {/* Show More Button Styled as Tag */}
                            {currentPage < totalPages && (
                                <button
                                    onClick={handleShowMore}
                                    className="inline-flex items-center px-3 py-1 rounded-full bg-gray-300 dark:bg-gray-500 text-gray-800 text-sm font-medium cursor-pointer"
                                >
                                    Show More
                                </button>
                            )}
                        </div>
                    )}
                </div>
                <div className='ml-2 mr-2 mb-4'>
                    {post && (<User id={post.authorId}></User>)}
                </div>

                <div className='ml-2 mr-2 break-words'>
                    {post && post.description && (<h4 className='ml-2 mt-2 text-lg'>{post.description}</h4>)}
                </div>

                <div className='flex relative justify-between items-start w-full'>
                    <div className="flex justify-between items-center space-x-4 w-full ml-2 mr-2">
                        <div className="flex items-center space-x-4">
                            <Toggle
                                pressed={isUpvoted}
                                onPressedChange={() => changeRating(!isUpvoted, false)}
                                disabled={!user}
                                variant='red'
                            >
                                {isUpvoted ? (<Heart fill='#ff0000' />) : (<Heart />)}Like
                            </Toggle>
                            <span className="text-xl font-bold">{post?.rating}</span>
                            <Toggle
                                pressed={isDownvoted}
                                onPressedChange={() => {
                                    changeRating(false, !isDownvoted);
                                }}
                                disabled={!user}
                            >
                                <HeartOff />
                            </Toggle>
                        </div>

                        <div className='flex'>
                            <div className='flex space-x-4'>
                                {user && post && post.authorId === user.id && (
                                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen} >
                                        <DialogTrigger asChild>
                                            <Button className='mt-2' onClick={() => {
                                                setTemplateSelectLoading(true)
                                                fetchPostTags()
                                                fetchAllTemplates()
                                            }}>Edit</Button>
                                        </DialogTrigger>
                                        <DialogContent className="sm:max-w-[95%] md:max-w-[60%] lg:max-w-[50%] max-h-[100vh] overflow-y-auto">
                                            <DialogHeader>
                                                <DialogTitle>Edit your post</DialogTitle>
                                                <DialogDescription>
                                                    Make changes to your post here. Click save when you're done.
                                                </DialogDescription>
                                            </DialogHeader>
                                            <div>
                                                <label className={`block text-md font-medium ${titleError ? 'text-red-600 font-bold' : ''}`}>Title</label>
                                                <Input
                                                    placeholder="Enter title"
                                                    className='w-full max-w-md sm:max-w-md md:max-w-lg lg:max-w-xl'
                                                    type="text"
                                                    value={newTitle}
                                                    onChange={(e) => handleTitle(e.target.value)}
                                                    maxLength={100}
                                                />
                                                {titleError && <p className="text-red-600 text-sm font-medium mt-1">{titleError}</p>}
                                                <label className={`block text-md font-medium mt-2 ${descriptionError ? 'text-red-600 font-bold' : ''}`}>Description</label>
                                                <Textarea
                                                    placeholder="Enter description"
                                                    value={newDescription}
                                                    onChange={(e) => handleDescription(e.target.value)}
                                                    rows={4}
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
                                            <EditTemplateSelect selectedTemplates={selectedTemplates} toggleTemplateSelection={toggleTemplateSelection} templateSelectLoading={templateSelectLoading} setTemplateSelectLoading={setTemplateSelectLoading}
                                                template={templates}
                                                TemplatePage={TemplatePage}
                                                totalTemplatePages={totalTemplatePages}
                                                templatesPerPage={templatesPerPage}
                                                id={id?.toString() || ''}
                                            />
                                            <DialogFooter>
                                                <Button type="submit" onClick={savePost}><Save />Save</Button>
                                            </DialogFooter>
                                        </DialogContent>
                                    </Dialog>
                                )}
                            </div>

                            {user && post && user.id === post.authorId && (
                                <AlertDialog>
                                    <AlertDialogTrigger>
                                        <Button variant="destructive" className='mt-2 ml-4'><Trash2 />Delete</Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>Warning</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                This action cannot be revoked. You will permanently lose your data from the server.
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90"><Trash2 />Delete</AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            )}

                            {user && post && user.id !== post.authorId && (
                                <ReportButton id={post.id} type="post"></ReportButton>
                            )}
                        </div>
                    </div>
                </div>

                {/* Display linked templates */}
                <div className='m-4 ml-2 mr-2'>
                    <h2 className="text-xl font-bold mt-4">Linked Templates</h2>
                    {loadingTemplates ? (
                        <p>Loading templates...</p>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {templates.map((template) => (
                                <TemplateItem
                                    key={template.id}
                                    id={template.id}
                                    title={template.title}
                                    description={template.description}
                                    language={template.language}
                                    forked={template.parentTemplate !== null}
                                />
                            ))}
                            {templates.length === 0 && (
                                <p>No templates found</p>
                            )}
                        </div>
                    )}
                </div>
                {templates.length > 0 && (
                    <Pagination className="mt-4">
                        <PaginationContent>
                            <PaginationPrevious
                                onClick={() => fetchTemplates(TemplatePage - 1)}
                                className={TemplatePage === 1 ? "disabled" : ""}
                            />
                            {TemplatePage - 2 >= 1 && <PaginationEllipsis />}
                            {TemplatePage - 1 >= 1 && (
                                <PaginationItem>
                                    <PaginationLink onClick={() => fetchTemplates(TemplatePage - 1)}>
                                        {TemplatePage - 1}
                                    </PaginationLink>
                                </PaginationItem>
                            )}
                            <PaginationItem>
                                <PaginationLink className='bg-white dark:bg-black'>{TemplatePage}</PaginationLink>
                            </PaginationItem>
                            {TemplatePage + 1 <= totalTemplatePages && (
                                <PaginationItem>
                                    <PaginationLink onClick={() => fetchTemplates(TemplatePage + 1)}>
                                        {TemplatePage + 1}
                                    </PaginationLink>
                                </PaginationItem>
                            )}
                            {TemplatePage + 2 <= totalTemplatePages && <PaginationEllipsis />}
                            <PaginationNext
                                onClick={() => fetchTemplates(TemplatePage + 1)}
                                className={TemplatePage === totalTemplatePages ? "disabled" : ""}
                            />
                        </PaginationContent>
                    </Pagination>
                )}

                <div className="mt-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Comment</label>
                    <Textarea
                        value={input}
                        onChange={handleInputChange}
                        placeholder="Write a comment..."
                        rows={3}
                        className="w-full"
                    />
                    <Button onClick={sendComment} className='mt-4 mb-2'>Reply</Button>
                </div>

                {showComment && (<CommentHolder id={Array.isArray(id) ? id[0] : id || ''} root={true} />)}
            </Card>
        </div>
    );
};

export default PostDetail;

const EditTemplateSelect: React.FC<{
    selectedTemplates: Set<number>;
    toggleTemplateSelection: (id: number) => void;
    templateSelectLoading: boolean;
    setTemplateSelectLoading: (loading: boolean) => void;
    template: Template[];
    TemplatePage: number;
    totalTemplatePages: number;
    templatesPerPage: number;
    id: string;
}> = ({
    selectedTemplates, toggleTemplateSelection, templateSelectLoading, setTemplateSelectLoading, template, TemplatePage, totalTemplatePages, templatesPerPage, id
}) => {
        const [templates, setTemplates] = useState<Template2[]>([]);
        const [query, setQuery] = useState<string>('');
        const [selectedTags, setSelectedTags] = useState<string[]>([]);
        const [page, setPage] = useState(1);
        const [totalPages, setTotalPages] = useState(1);
        const [isFetching, setIsFetching] = useState(false);


        useEffect(() => {
            setTemplateSelectLoading(true);
        }, [selectedTags]);



        const fetchTemplates = async () => {
            if (isFetching) {
                console.log("Fetch already in progress, skipping.");
                return; // Prevent duplicate fetches
            }
            setIsFetching(true);
            console.log("Fetching templates...");

            try {
                const response = await axios.get(`/api/template`, {
                    params: { query, page, perPage: 8, tags: selectedTags.join(',') },
                });
                console.log("API response:", response.data);

                setTemplates(response.data.results);
                setTotalPages(response.data.totalPages);
            } catch (error) {
                console.error("Error fetching templates:", error);
            } finally {
                setIsFetching(false);
                setTemplateSelectLoading(false);
            }
        };

        useEffect(() => {
            console.log("useEffect triggered. templateSelectLoading:", templateSelectLoading);
            if (templateSelectLoading) {
                fetchTemplates();
            }
        }, [templateSelectLoading, page, query, selectedTags]);

        const handleNextPage = () => {
            if (page < totalPages) {
                console.log("Next page:", page + 1);
                setPage((prevPage) => prevPage + 1);
                setTemplateSelectLoading(true);
            }
        };

        const handlePreviousPage = () => {
            if (page > 1) {
                console.log("Previous page:", page - 1);
                setPage((prevPage) => prevPage - 1);
                setTemplateSelectLoading(true);
            }
        };

        return (
            <div>
                <Card className='container mx-auto p-4 mb-4'>
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
                                onChange={(e) => {
                                    console.log("Query updated:", e.target.value);
                                    setQuery(e.target.value);
                                    setTemplateSelectLoading(true);
                                }}
                                className="pl-10"
                            />
                        </div>

                        <div className="mt-4">
                            <label className="block text-sm font-medium mb-2">Filter by Tags</label>
                            <TagComboboxNewTag selectedTags={selectedTags} setSelectedTags={setSelectedTags} />
                        </div>

                        <div className="mt-4 space-y-4">
                            {isFetching ? (
                                <p>Loading templates...</p>
                            ) : templates.length > 0 ? (
                                templates.map((template) => (
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
                                ))
                            ) : (
                                <p>No templates found</p>
                            )}
                        </div>
                        <div className="flex justify-between mt-4">
                            <Button onClick={handlePreviousPage} disabled={page === 1}>
                                <ChevronLeft /> Previous
                            </Button>
                            <Button onClick={handleNextPage} disabled={page === totalPages}>
                                Next <ChevronRight />
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    };
