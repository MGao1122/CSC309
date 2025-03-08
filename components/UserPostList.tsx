import React, { use, useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { Button } from "@/components/ui/button";
import { Plus } from 'lucide-react';
import PostItem from './PostItem';
import PostItemHidden from './PostItemHidden';
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
import { set } from 'react-hook-form';

interface Post {
    id: number;
    title: string;
    description: string;
    visibility: boolean;
    rating: number;
}

interface ApiResponse {
    results: Post[];
    page: number;
    perPage: number;
    totalPages: number;
}

const UserPostList: React.FC = () => {
    const [posts, setPosts] = useState<Post[]>([]);
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
        const pageFromQuery = parseInt(router.query.userPostPage as string, 10);
        if (!isNaN(pageFromQuery) && pageFromQuery > 0) {
            setCurrentPage(pageFromQuery);
        }
        setFirstLoad(false);
    }, [router]);

    const fetchUserPosts = async (page: number) => {
        // setLoading(true);
        setError(null);

        try {
            const response = await api.get<ApiResponse>(`/posts/auth`, {
                params: {
                    page,
                    perPage: 4,
                    query,
                    tags: selectedTags.join(',')
                }
            });
            const data = response.data;
            setPosts(data.results || []);
            // setCurrentPage(data.page ?? 1);
            setTotalPages(data.totalPages ?? 1);
        } catch (error) {
            setError(error instanceof Error ? error.message : "An error occurred.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUserPosts(currentPage);
        if (!firstLoad) {
            // fetchUserPosts(currentPage);
            router.push({
                pathname: router.pathname,
                query: {
                    ...router.query,
                    userPostPage: currentPage.toString()
                }
            }, undefined, { shallow: true });
        }
    }, [currentPage]);

    useEffect(() => {
        setCurrentPage(1);
        handleSearch();
    }, [selectedTags, query]);

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
                userPostPage: '1'
            }
        }, undefined, { shallow: true });
        fetchUserPosts(1);
    };

    return (
        <div className="container mx-auto p-4">
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold">Your Posts</h1>
                <Button variant="outline" onClick={() => router.push('/user/create_post')} className='bg-white/30 dark:bg-black/30 border border-gray-800/30 dark:border-gray-400/30 text-gray-700 hover:bg-white/50 dark:text-gray-300 dark:hover:bg-gray-800/50 transition-colors duration-500 transition-ease-in-out'>
                    <Plus />Create
                </Button>
            </div>

            {/* Search bar and Tag filter */}
            <div className="sm:flex-row items-start sm:items-center gap-4 mb-6">
                <Input
                    type="text"
                    placeholder="Search posts..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
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
            {posts.length > 0 ? (
                <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-4">
                        {posts.map(post => (
                            post.visibility ? (
                                <PostItem
                                    key={post.id}
                                    id={post.id}
                                    title={post.title}
                                    description={post.description}
                                    rating={post.rating}
                                />
                            ) : (
                                <PostItemHidden
                                    key={post.id}
                                    id={post.id}
                                    title={post.title}
                                    description={post.description}
                                />
                            )
                        ))}
                    </div>

                    {/* Pagination component */}
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
                <p className="text-foreground">No posts available.</p>
            )}
        </div>
    );
};

export default UserPostList;