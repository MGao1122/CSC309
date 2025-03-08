// pages/posts/[id].tsx
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { Card } from "@/components/ui/card";
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
import { TriangleAlert } from 'lucide-react';
import axios from 'axios';
import { Heart, HeartOff, Trash2 } from 'lucide-react';

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
    const [tags, setTags] = useState<string[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const tagsPerPage = 5;
    const [totalPages, setTotalPages] = useState(1);
    const [input, setInput] = useState<string>('');
    const [templates, setTemplates] = useState<Template[]>([]);
    const [loadingTemplates, setLoadingTemplates] = useState(true);
    const [TemplatePage, setTemplatePage] = useState(1);
    const templatesPerPage = 8;
    const [totalTemplatePages, setTotalTemplatePages] = useState(1);
    const [showComment, setShowComment] = useState(false);

    const { user } = useAuth();

    const [isUpvoted, setIsUpvoted] = useState(false);
    const [isDownvoted, setIsDownvoted] = useState(false);

    const [countdown, setCountdown] = useState(5);

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

    const fetchTemplates = async (page: number) => {
        try {
            const response = await fetch(`/api/find/post/template/${id}?page=${page}&perPage=${templatesPerPage}`);
            const data = await response.json();
            if (data.results && data.results.templates) {
                setTemplates(data.results.templates);
                setTotalTemplatePages(data.totalPages); // Set total pages from the response
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

    useEffect(() => {
        if (id) {
            const fetchPost = async () => {
                try {
                    const response = await api.get(`http://localhost:3000/api/posts/auth/${id}`);
                    if (response.data) {
                        setPost(response.data);
                    } else {
                        setError(response.data.error || "Post not found");
                    }
                    fetchTemplates(1);
                    fetchTags(1);
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

    return (
        <div className='container px-2 py-2'>
            <Card className="container mx-auto p-4 max-w-screen mb-4">
                <h1 className="text-4xl font-semibold m-4 mb-2">{post?.title}</h1>
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
                <h3 className='text-red-500 flex items-center mt-4 mb-4 ml-6'>
                    <TriangleAlert className="mr-2" />
                    This post violates the community regulation and has been hidden.
                </h3>

                <div className='ml-2 mr-2 break-words'>
                    {post && post.description && (<h4 className='ml-2 mt-2 text-lg'>{post.description}</h4>)}
                </div>

                <div className='flex relative justify-between items-start w-full'>
                    <div className="flex justify-between items-center space-x-4 w-full ml-2 mr-2">
                        <div className="flex items-center space-x-4">
                            <Toggle
                                pressed={isUpvoted}
                                onPressedChange={() => changeRating(!isUpvoted, false)}
                                disabled={true}
                                variant='red'
                            >
                                <Heart />Like
                            </Toggle>
                            <span className="text-xl font-bold">{post?.rating}</span>
                            <Toggle
                                pressed={isDownvoted}
                                onPressedChange={() => {
                                    changeRating(false, !isDownvoted);
                                }}
                                disabled={true}
                            >
                                <HeartOff />
                            </Toggle>
                        </div>

                        <div className='flex'>
                            {user && post && user.id === post.authorId && (
                                <Button variant="destructive" className='mt-2 ml-4' onClick={handleDelete}><Trash2 />Delete</Button>
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
            </Card>
        </div>
    );
};

export default PostDetail;
