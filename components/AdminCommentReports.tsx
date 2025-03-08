import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useRouter } from "next/router";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import api from "@/services/authService";
import FrostedGlass from "./FrostedGlass";
import { Toggle } from "./ui/toggle";
import Link from "next/link";
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationPrevious,
    PaginationNext,
    PaginationEllipsis
} from '@/components/ui/pagination';
import path from "path";
import { queryObjects } from "v8";

interface Comment {
    id: number;
    content: string;
    authorId: number;
    blogPostId: number;
    visibility: boolean;
    reportCount: number;
    report: Report[];
}

interface Report {
    id: number;
}

const AdminCommentReports = () => {
    const [comments, setComments] = useState<Comment[]>([]);
    const [currentPage, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const perPage = 8;
    const router = useRouter();
    const { user, loading } = useAuth();
    const [showHidden, setShowHidden] = useState(false);
    const { query } = router;

    const fetchComments = async () => {
        try {
            const { data } = await api.get(`/admin/comment?page=${currentPage}&perPage=${perPage}&showHidden=${!showHidden}`);
            setComments(data.results);
            setPage(data.page);
            setTotalPages(data.totalPages);
        } catch (error) {
            console.error(error);
        }
    };

    const handlePageClick = (page: number) => {
        if (page >= 1 && page <= totalPages) {
            setPage(page);
            router.push({
                pathname: router.pathname,
                query: { ...query, commentPage: page.toString() }
            }, undefined, { shallow: true });
        }

    }

    useEffect(() => {
        fetchComments();
    }, [currentPage, showHidden, router]);

    useEffect(() => {
        console.log(showHidden);
    }, [showHidden]);


    return (
        <div className="container mx-auto p-4">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">Comment Reports</h1>
                <Toggle
                    pressed={showHidden}
                    onPressedChange={() => setShowHidden(!showHidden)}
                    variant={'outline'}
                >
                    Show Hidden
                </Toggle>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-4 mt-2">
                {comments.map((comment) => (
                    <Link href={`/admin/comment/${comment.id}?reportId=${comment.report[0].id}`} key={comment.id}>
                        <FrostedGlass key={comment.id} className={`h-48 flex flex-col break-words overflow-hidden cursor-pointer hover:bg-white/60 dark:hover:bg-black/60 transition-colors duration-500 transition-ease-in-out`}>
                            <CardHeader className="p-2 break-word">
                                <h4>{comment.content.slice(0, 30)}{comment.content.length > 30 ? '...' : ''}</h4>
                            </CardHeader>
                            <CardContent className="relative h-full flex flex-col p-2">
                                <p className="break-words overflow-hidden">
                                    Comment ID: {comment.id}
                                </p>
                                <p className="break-words overflow-hidden">
                                    Report Count:
                                    <span className="font-bold"> {comment.reportCount}</span>
                                </p>
                                {comment.visibility ? <p className="text-green-500">Visible</p> : <p className="text-red-500">Hidden</p>}
                            </CardContent>
                        </FrostedGlass>
                    </Link>
                ))}
            </div>
            {comments.length > 0 && (
                <Pagination className="mt-4">
                    <PaginationContent>
                        <PaginationPrevious
                            onClick={() => handlePageClick(currentPage - 1)}
                            className={currentPage === 1 ? "disabled  hover:bg-white/50 dark:hover:bg-gray-800/50 transition-colors duration-500 transition-ease-in-out transition cursor-pointer" : "hover:bg-white/50 dark:hover:bg-gray-800/50 cursor-pointer"}
                        />
                        {currentPage - 2 >= 1 && <PaginationEllipsis />}
                        {currentPage - 1 >= 1 && (
                            <PaginationItem>
                                <PaginationLink onClick={() => handlePageClick(currentPage - 1)} className='bg-white/30 dark:bg-black/30 border border-gray-800/30 dark:border-gray-400/30 text-gray-700 hover:bg-white/50 dark:text-gray-300 dark:hover:bg-gray-800/50 transition-colors duration-500 transition-ease-in-out cursor-pointer'>
                                    {currentPage - 1}
                                </PaginationLink>
                            </PaginationItem>
                        )}
                        <PaginationItem>
                            <PaginationLink isActive className='bg-white/50 dark:bg-black/50 border border-gray-800/30 dark:border-gray-400/30 text-gray-700 hover:bg-white/50 dark:text-gray-300 dark:hover:bg-gray-800/50 transition-colors duration-500 transition-ease-in-out cursor-pointer'>{currentPage}</PaginationLink>
                        </PaginationItem>
                        {currentPage + 1 <= totalPages && (
                            <PaginationItem>
                                <PaginationLink onClick={() => handlePageClick(currentPage + 1)} className='bg-white/30 dark:bg-black/30 border border-gray-800/30 dark:border-gray-400/30 text-gray-700 hover:bg-white/50 dark:text-gray-300 dark:hover:bg-gray-800/50 transition-colors duration-500 transition-ease-in-out cursor-pointer'>
                                    {currentPage + 1}
                                </PaginationLink>
                            </PaginationItem>
                        )}
                        {currentPage + 2 <= totalPages && <PaginationEllipsis />}
                        <PaginationNext
                            onClick={() => handlePageClick(currentPage + 1)}
                            className={currentPage === totalPages ? "disabled  hover:bg-white/50 dark:hover:bg-gray-800/50 transition-colors duration-500 transition-ease-in-out transition cursor-pointer" : "hover:bg-white/50 dark:hover:bg-gray-800/50 cursor-pointer"}
                        />
                    </PaginationContent>
                </Pagination>
            )}
            {comments.length === 0 && <p>No comments to show</p>}
        </div>
    );

}

export default AdminCommentReports;