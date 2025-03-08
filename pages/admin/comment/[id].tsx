import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/router";
import { Card } from "@/components/ui/card";
import api from "@/services/authService";
import User from "@/components/User";
import CodeEditor from "@/components/CodeEditor";
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationPrevious,
    PaginationNext,
    PaginationEllipsis
} from '@/components/ui/pagination';
import { Button } from "@/components/ui/button";

interface Report {
    id: number;
    content: string;
    authorId: number;
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


export default function CommentReport() {
    const router = useRouter();
    const { id, reportId } = router.query;
    const { user } = useAuth();
    const [error, setError] = useState<string | null>(null);
    const [countdown, setCountdown] = useState(5);
    const [loading, setLoading] = useState(true); // Add loading state
    const [reports, setReports] = useState<Report[]>([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [comment, setComment] = useState<Comment>();
    const [visibility, setVisibility] = useState(true);

    const fetchReports = async () => {
        if (!id) return; // Prevent API call if id is undefined

        try {
            const response = await api.get(`/find/admin/comment/${id}?page=${page}&perPage=8`);
            setReports(response.data.results.report);
            setTotalPages(response.data.totalPages);
        } catch (error) {
            console.error("Error fetching reports:", error);
            setError("An error occurred while fetching reports");
        } finally {
            setLoading(false);
        }
    };

    const fetchComment = async () => {
        if (!id) return; // Prevent API call if id is undefined

        try {
            const response = await api.get(`/admin/comment/${id}`);
            setComment(response.data);
            setVisibility(response.data.visibility);
        } catch (error) {
            console.error("Error fetching post:", error);
            setError("An error occurred while fetching post");
        } finally {
            setLoading(false);
        }
    };


    useEffect(() => {
        if (id) {
            fetchReports();
            fetchComment();
        }
    }, [id, page]);

    useEffect(() => {
        if (!user && !loading) {
            setError("You are not authorized to access this page");
        }
    }, [user, loading]);

    useEffect(() => {
        if (error) {
            const interval = setInterval(() => {
                setCountdown((prev) => prev - 1);
            }, 1000);

            if (countdown <= 0) {
                clearInterval(interval);
                router.push("/");
            }

            return () => clearInterval(interval);
        }
    }, [error, countdown, router]);

    // Render loading state
    if (loading || (!user && !error)) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <p className="text-xl font-semibold">Loading...</p>
            </div>
        );
    }

    // Render error state
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

    const ban = (visibility: boolean) => async () => {
        try {
            await api.put(`/admin/${reportId}`, { commentVisibility: visibility });
            setVisibility(visibility);
        } catch (error) {
            console.error("Error updating template visibility:", error);
            setError("An error occurred while updating the template visibility");
        }
    }

    return (
        <div className="container mx-auto p-2">
            <Card className="p-8 container">
                <h1 className="text-4xl">Comment:</h1>
                <div className="m-4">
                    {comment?.authorId !== undefined && <User id={comment.authorId} />}
                    <h1 className="text-2xl font-semibold break-words mt-2">{comment?.content}</h1>
                </div>
                <h2 className="text-lg font-semibold mt-8 mb-4">Reports</h2>
                {reports.map((report) => (
                    <Card key={report.id} className="p-4 mb-4">
                        <User id={report.authorId} />
                        <p className="text-lg text-gray-600 dark:text-white mt-2">{report.content}</p>
                    </Card>
                ))}
                <Pagination className="mt-4">
                    <PaginationContent>
                        <PaginationPrevious
                            onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                            className={page === 1 ? "disabled  hover:bg-white/50 dark:hover:bg-gray-800/50 transition-colors duration-500 transition-ease-in-out transition cursor-pointer" : "hover:bg-white/50 dark:hover:bg-gray-800/50 cursor-pointer"}
                        />
                        {page - 2 >= 1 && <PaginationEllipsis />}
                        {page - 1 >= 1 && (
                            <PaginationItem>
                                <PaginationLink onClick={() => setPage(page - 1)} className='bg-white/30 dark:bg-black/30 border border-gray-800/30 dark:border-gray-400/30 text-gray-700 hover:bg-white/50 dark:text-gray-300 dark:hover:bg-gray-800/50 transition-colors duration-500 transition-ease-in-out cursor-pointer'>
                                    {page - 1}
                                </PaginationLink>
                            </PaginationItem>
                        )}
                        <PaginationItem>
                            <PaginationLink isActive className='bg-white/30 dark:bg-black/30 border border-gray-800/30 dark:border-gray-400/30 text-gray-700 hover:bg-white/50 dark:text-gray-300 dark:hover:bg-gray-800/50 transition-colors duration-500 transition-ease-in-out cursor-pointer'>{page}</PaginationLink>
                        </PaginationItem>
                        {page + 1 <= totalPages && (
                            <PaginationItem>
                                <PaginationLink onClick={() => setPage(page + 1)} className='bg-white/30 dark:bg-black/30 border border-gray-800/30 dark:border-gray-400/30 text-gray-700 hover:bg-white/50 dark:text-gray-300 dark:hover:bg-gray-800/50 transition-colors duration-500 transition-ease-in-out cursor-pointer'>
                                    {page + 1}
                                </PaginationLink>
                            </PaginationItem>
                        )}
                        {page + 2 <= totalPages && <PaginationEllipsis />}
                        <PaginationNext
                            onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
                            className={page === totalPages ? "disabled  hover:bg-white/50 dark:hover:bg-gray-800/50 transition-colors duration-500 transition-ease-in-out transition cursor-pointer" : "hover:bg-white/50 dark:hover:bg-gray-800/50 cursor-pointer"}
                        />
                    </PaginationContent>
                </Pagination>

                {visibility && (
                    <>
                        <Button onClick={ban(false)} className="mt-4 bg-red-500">
                            Hide Comment
                        </Button>
                        <p className="mt-4 text-lg text-gray-600 dark:text-white">This comment is currently visible to users.</p>
                    </>
                )}
                {!visibility && (
                    <>
                        <Button onClick={ban(true)} className="mt-4 bg-green-500">
                            Show Comment
                        </Button>
                        <p className="mt-4 text-lg text-gray-600 dark:text-white">This comment is currently hidden from users.</p>
                    </>
                )}
            </Card>
        </div>
    )
}