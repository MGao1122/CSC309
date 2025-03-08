// TemplateList Component
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { Button } from "@/components/ui/button";
import { ChevronsRight } from 'lucide-react';
import TemplateItem from './TemplateItem';
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationPrevious,
    PaginationNext,
    PaginationEllipsis
} from './ui/pagination';

interface Template {
    id: number;
    title: string;
    description: string | null;
    language: string;
    parentTemplate: string | null;
    authorId: number;
}

interface ApiResponse {
    results: Template[];
    page: number;
    perPage: number;
    totalPages: number;
}

const TemplateList: React.FC = () => {
    const [templates, setTemplates] = useState<Template[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [totalPages, setTotalPages] = useState<number>(1);

    const router = useRouter();
    const { query } = router;

    const fetchTemplates = async (page: number) => {
        // setLoading(true);
        try {
            const response = await fetch(`http://localhost:3000/api/template?page=${page}&perPage=8`);
            const data: ApiResponse = await response.json();
            setTemplates(data.results || []);
            setCurrentPage(data.page);
            setTotalPages(data.totalPages);
        } catch (error) {
            console.error("Error fetching templates:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const initialPage = query.templatePage ? parseInt(query.templatePage as string) : 1; // Use distinct query parameter
        setCurrentPage(initialPage);
        fetchTemplates(initialPage);
    }, [query.templatePage]);

    const handlePageClick = (page: number) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
            router.push({
                pathname: router.pathname,
                query: { ...query, templatePage: page.toString() }, // Use distinct query parameter
            }, undefined, { shallow: true });
        }
    };

    if (loading) {
        return <p>Loading templates...</p>;
    }

    return (
        <div className="container mx-auto p-4">
            <div className="flex justify-between">
                <h1 className="text-2xl font-bold mb-4">Template List</h1>
                <Button variant="outline" onClick={() => router.push('/template')} className='bg-white/30 dark:bg-black/30 border border-gray-800/30 dark:border-gray-400/30 text-gray-700 hover:bg-white/50 dark:text-gray-300 dark:hover:bg-gray-800/50 transition-colors duration-500 transition-ease-in-out'>
                    <ChevronsRight />View All
                </Button>
            </div>
            {templates.length > 0 ? (
                <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-4">
                        {templates.map(template => (
                            <TemplateItem
                                key={template.id}
                                id={template.id}
                                title={template.title}
                                description={template.description}
                                language={template.language}
                                forked={template.parentTemplate !== null}
                            />
                        ))}
                    </div>

                    {/* Pagination Component */}
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
                </>
            ) : (
                <p className="text-foreground">No templates available.</p>
            )}
        </div>
    );
};

export default TemplateList;
