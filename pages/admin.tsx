import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/router';
import { set } from 'react-hook-form';
import { Card } from '@/components/ui/card';
import TemplateReports from '@/components/TemplateReport';
import api from '@/services/authService';
import PostReports from '@/components/PostReport';
import CommentReports from '@/components/CommentReport';
import AdminTemplateReports from '@/components/AdminTemplateReports';
import AdminPostReports from '@/components/AdminPostReports';
import AdminCommentReports from '@/components/AdminCommentReports';

interface Template {
    id: number;
    title: string;
    description: string | null;
    content: string;
    authorId: number;
    visibility: boolean;
    reportCount: number;
    report: Report[];
}

interface Report {
    id: number;
}

interface TemplatesResponse {
    results: Template[];
    page: number;
    perPage: number;
    totalPages: number;
}

interface Post {
    id: number;
    title: string;
    description: string | null;
    authorId: number;
    visibility: boolean;
    reportCount: number;
    report: Report[];
}

interface PostsResponse {
    results: Post[];
    page: number;
    perPage: number;
    totalPages: number;
}

interface Comment {
    id: number;
    content: string;
    authorId: number;
    blogPostId: number;
    visibility: boolean;
    reportCount: number;
    report: Report[];
}

interface CommentsResponse {
    results: Comment[];
    page: number;
    perPage: number;
    totalPages: number;
}

const AdminPanel: React.FC = () => {
    const router = useRouter();
    const { user } = useAuth();
    const [error, setError] = useState<string | null>(null);
    const [countdown, setCountdown] = useState(5);
    const [templates, setTemplates] = useState<TemplatesResponse | null>(null);
    const [loading, setLoading] = useState(true); // Add loading state
    const [posts, setPosts] = useState<PostsResponse | null>(null);
    const [comments, setComments] = useState<CommentsResponse | null>(null);

    useEffect(() => {
        const fetchTemplates = async () => {
            try {
                const response = await api.get('/admin/template');
                setTemplates(response.data);
            } catch (error) {
                setError('Failed to fetch templates');
            } finally {
                setLoading(false);
            }
        };

        const fetchPosts = async () => {
            try {
                const response = await api.get('/admin/post');
                setPosts(response.data);
            } catch (error) {
                setError('Failed to fetch posts');
            } finally {
                setLoading(false);
            }
        }

        const fetchComments = async () => {
            try {
                const response = await api.get('/admin/comment');
                setComments(response.data);
            } catch (error) {
                setError('Failed to fetch comments');
            } finally {
                setLoading(false);
            }
        }

        fetchTemplates();
        fetchPosts();
        fetchComments();
    }, []);

    useEffect(() => {
        if (!user && !loading) {
            setError('You are not authorized to access this page');
        }
    }, [user, loading]);

    useEffect(() => {
        if (error) {
            const interval = setInterval(() => {
                setCountdown((prev) => prev - 1);
            }, 1000);

            if (countdown <= 0) {
                clearInterval(interval);
                router.push('/');
            }

            return () => clearInterval(interval);
        }
    }, [error, countdown, router]);

    if (loading || (!user && !error)) {
        return <p>Loading...</p>; // Show loading until user is verified
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

    return (
        <div className='containter px-2 py-2'>
            <Card className="p-4 container">
                <h1 className="text-3xl font-semibold mx-4 mt-2">Admin Panel</h1>
                <AdminTemplateReports />
                <AdminPostReports />
                <AdminCommentReports />
            </Card>
        </div>
    );
};

export default AdminPanel;
