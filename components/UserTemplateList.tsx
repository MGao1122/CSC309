import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { Button } from "@/components/ui/button";
import { Plus, Search } from "lucide-react";
import TemplateItem from './TemplateItem';
import { Input } from '@/components/ui/input';
import { TagCombobox } from '@/components/TagCombobox';
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationPrevious,
    PaginationNext,
    PaginationEllipsis
} from './ui/pagination';
import api from '@/services/authService';
import TemplateItemHidden from './TemplateItemHidden';
import { set } from 'react-hook-form';

interface Template {
    id: number;
    title: string;
    description: string | null;
    language: string;
    parentTemplate: string | null;
    authorId: number;
    visibility: boolean;
}

interface ApiResponse {
    results: Template[];
    page: number;
    perPage: number;
    totalPages: number;
}

const UserTemplateList: React.FC = () => {
    const [templates, setTemplates] = useState<Template[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [totalPages, setTotalPages] = useState<number>(1);
    const [query, setQuery] = useState<string>(''); // Search query state
    const [selectedTags, setSelectedTags] = useState<string[]>([]); // Tags state
    const [firstLoad, setFirstLoad] = useState<boolean>(true);
    const [secondLoad, setSecondLoad] = useState<boolean>(true);

    const router = useRouter();

    useEffect(() => {
        // Get the page number from the URL query parameters
        const pageFromQuery = parseInt(router.query.userTemplatePage as string, 10);
        if (!isNaN(pageFromQuery) && pageFromQuery > 0) {
            setCurrentPage(pageFromQuery);
        }
        setFirstLoad(false);
    }, [router]);

    const fetchUserTemplates = async (page: number) => {
        // setLoading(true);
        setError(null);

        try {
            const response = await api.get<ApiResponse>(`/template/auth`, {
                params: {
                    page,
                    perPage: 4,
                    query,
                    tags: selectedTags.join(',')
                }
            });
            const data = response.data;
            setTemplates(data.results || []);
            // setCurrentPage(data.page ?? 1);
            setTotalPages(data.totalPages ?? 1);

        } catch (error) {
            setError(error instanceof Error ? error.message : "An error occurred.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUserTemplates(currentPage);
        if (!firstLoad) {
            router.push({
                pathname: router.pathname,
                query: {
                    ...router.query,
                    userTemplatePage: currentPage.toString()
                }
            }, undefined, { shallow: true });
        }
    }, [currentPage]);

    useEffect(() => {
        setCurrentPage(1);
        handleSearch();
    }, [query, selectedTags]);

    const handlePageClick = (page: number) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    const handleSearch = () => {
        setCurrentPage(1); // Reset to first page on search
        router.push({
            pathname: router.pathname,
            query: {
                ...router.query,
                userTemplatePage: '1'
            }
        }, undefined, { shallow: true });
        fetchUserTemplates(1);
    };


    return (
        <div className="container mx-auto p-4">
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold">Your Templates</h1>
                <Button variant="outline" onClick={() => router.push('/user/create_template')} className='bg-white/30 dark:bg-black/30 border border-gray-800/30 dark:border-gray-400/30 text-gray-700 hover:bg-white/50 dark:text-gray-300 dark:hover:bg-gray-800/50 transition-colors duration-500 transition-ease-in-out'>
                    <Plus />Create
                </Button>
            </div>

            {/* Search bar */}
            {/* <div className="flex mb-4 space-x-2">
                <div className="relative w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search />
                    </span>
                    <Input
                        placeholder="Search templates..."
                        onChange={(e) => setQuery(e.target.value)}
                        value={query}
                        className="border p-2 pl-10 flex-grow rounded"
                    />
                </div>
                <Button onClick={handleSearch} className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
                    Search
                </Button>
            </div>

            <div className="flex mb-4 space-x-2 items-center">
                <TagCombobox selectedTags={selectedTags} setSelectedTags={setSelectedTags} />
            </div> */}

            {/* Search bar and Tag filter */}
            <div className="sm:flex-row items-start sm:items-center gap-4 mb-6">
                <Input
                    type="text"
                    placeholder="Search templates..."
                    value={query}
                    onChange={(e) => { setQuery(e.target.value); }}
                    className="w-full sm:w-1/3 bg-white/30 dark:bg-black/30 border border-gray-800/30 dark:border-gray-400/30 text-gray-700 hover:bg-white/50 dark:text-gray-300 dark:hover:bg-gray-800/50 transition-colors duration-500 transition-ease-in-out"
                />
                <div className="w-full sm:w-1/3 mt-2">
                    <TagCombobox
                        selectedTags={selectedTags}
                        setSelectedTags={setSelectedTags}
                    />
                </div>
            </div>

            {error && <p className="text-red-500">{error}</p>}
            {templates.length > 0 ? (
                <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-4">
                        {templates.map(template => (
                            template.visibility ? (
                                <TemplateItem
                                    key={template.id}
                                    id={template.id}
                                    title={template.title}
                                    description={template.description}
                                    language={template.language}
                                    forked={template.parentTemplate !== null}
                                />
                            ) : (
                                <TemplateItemHidden
                                    key={template.id}
                                    id={template.id}
                                    title={template.title}
                                    description={template.description}
                                    language={template.language}
                                    forked={template.parentTemplate !== null}
                                />
                            )
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

export default UserTemplateList;
