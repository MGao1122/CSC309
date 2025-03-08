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

interface Template {
    id: number;
    title: string;
    description: string | null;
    content: string;
    language: string;
    authorId: number;
    visibility: boolean;
    reportCount: number;
}

export default function TemplateReport() {
    const router = useRouter();
    const { id, reportId } = router.query;
    const { user } = useAuth();
    const [error, setError] = useState<string | null>(null);
    const [countdown, setCountdown] = useState(5);
    const [loading, setLoading] = useState(true); // Add loading state
    const [reports, setReports] = useState<Report[]>([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [template, setTemplate] = useState<Template>();
    const [visibility, setVisibility] = useState(true);

    const fetchReports = async () => {
        if (!id) return; // Prevent API call if id is undefined

        try {
            const response = await api.get(`/find/admin/template/${id}?page=${page}&perPage=8`);
            setReports(response.data.results.report);
            setTotalPages(response.data.totalPages);
        } catch (error) {
            console.error("Error fetching reports:", error);
            setError("An error occurred while fetching reports");
        } finally {
            setLoading(false);
        }
    };

    const fetchTemplate = async () => {
        if (!id) return; // Prevent API call if id is undefined

        try {
            const response = await api.get(`/admin/template/${id}`);
            setTemplate(response.data);
            setVisibility(response.data.visibility);
        } catch (error) {
            console.error("Error fetching template:", error);
            setError("An error occurred while fetching the template");
        } finally {
            setLoading(false);
        }
    };

    // Fetch reports whenever the page or id changes
    useEffect(() => {
        if (id) {
            fetchTemplate();
            fetchReports();
        }
    }, [id, page]);

    // Check user authentication and authorization
    useEffect(() => {
        if (!user && !loading) {
            setError("You are not authorized to access this page");
        }
    }, [user, loading]);

    // Redirect to home page on error
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
            await api.put(`/admin/${reportId}`, { templatedVisibility: visibility });
            setVisibility(visibility);
        } catch (error) {
            console.error("Error updating template visibility:", error);
            setError("An error occurred while updating the template visibility");
        }
    }
    // Render the report list
    return (
        <div className="container mx-auto p-2">
            <Card className="p-8 container">
                <h1 className="text-4xl">Template:</h1>
                <div className="m-4">
                    {template?.authorId && <User id={template.authorId} />}
                    <h1 className="text-2xl font-semibold my-2 break-words">{template?.title}</h1>
                    <h2 className="text-lg font-semibold mb-2 break-words">{template?.description}</h2>
                    <CodeEditor
                        content={template?.content || ''}
                        language={template?.language || 'plaintext'}
                        theme="vs-dark"
                        onChange={() => { }}
                        readOnly
                    />
                    <Button className="mt-4 bg-blue-500" onClick={() => router.push(`/template/${id}`)}>Template Link</Button>
                </div>
                <h1 className="text-lg font-semibold mb-4 mt-8">Reports</h1>
                <div>
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
                </div>

                {visibility && (
                    <>
                        <Button onClick={ban(false)} className="mt-4 bg-red-500">
                            Hide Template
                        </Button>
                        <p className="mt-4 text-lg text-gray-600 dark:text-white">This template is currently visible to users.</p>
                    </>
                )}
                {!visibility && (
                    <>
                        <Button onClick={ban(true)} className="mt-4 bg-green-500">
                            Show Template
                        </Button>
                        <p className="mt-4 text-lg text-gray-600 dark:text-white">This template is currently hidden from users.</p>
                    </>
                )}
            </Card>
        </div>
    );
}
