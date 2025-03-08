// pages/posts/index.tsx
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from 'lucide-react';
import { Plus } from "lucide-react";
import axios from 'axios';
import PostItem from '../../components/PostItem';
import { TagCombobox } from '@/components/TagCombobox';  // Import TagCombobox
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationPrevious,
    PaginationNext,
    PaginationEllipsis
} from '@/components/ui/pagination';
import { set } from 'react-hook-form';

type Post = {
    id: number;
    title: string;
    description: string;
    tags?: string[];
    rating: number;
};

const PostsIndex: React.FC = () => {
    const [posts, setPosts] = useState<Post[]>([]);
    const [displayMode, setDisplayMode] = useState<'list' | 'card'>('list');
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [tags, setTags] = useState<string[]>([]);  // State for selected tags
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [totalPages, setTotalPages] = useState<number>(1);

    const router = useRouter();

    useEffect(() => {
        // Get the page number from the URL query parameters
        const pageFromQuery = parseInt(router.query.postPage as string, 10);
        if (!isNaN(pageFromQuery) && pageFromQuery > 0) {
            setCurrentPage(pageFromQuery);
        }
    }, [router.query.postPage]);


    const fetchPosts = async (query = '', tags = '', page: number) => {
        try {
            const response = await axios.get(`http://localhost:3000/api/posts?page=${page}&perPage=${12}`, {
                params: query || tags ? { query: query, tags } : {},
            });
            setPosts(response.data.results);
            setTotalPages(response.data.totalPages);
        } catch (error) {
            console.error('Error fetching posts:', error);
        }
    };

    useEffect(() => {
        const tagsParam = tags.join(',');
        fetchPosts(searchQuery, tagsParam, currentPage);
    }, [currentPage]);

    const handleSearch = () => {
        const tagsParam = tags.join(',');
        setCurrentPage(1);
        router.push({
            pathname: router.pathname,
            query: {
                ...router.query,
                postPage: '1'
            }
        }, undefined, { shallow: true });
        if (currentPage === 1)
            fetchPosts(searchQuery, tagsParam, currentPage);
    };

    const handlePageClick = (page: number) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
            router.push({
                pathname: router.pathname,
                query: {
                    ...router.query,
                    postPage: page.toString()
                }
            }, undefined, { shallow: true });
        }
    };

    return (
        <div className="p-4 container mx-auto">
            <div className="flex justify-between">
                <h1 className="text-2xl font-bold mb-4">Posts</h1>
                <Button variant="outline" onClick={() => router.push('/user/create_post')} className='bg-white/30 dark:bg-black/30 border border-gray-800/30 dark:border-gray-400/30 text-gray-700 hover:bg-white/50 dark:text-gray-300 dark:hover:bg-gray-800/50 transition-colors duration-500 transition-ease-in-out'>
                    <Plus />Create
                </Button>
            </div>

            <div className="flex mb-4 space-x-2">
                <div className="relative w-full max-w-md sm:max-w-lg md:max-w-xl lg:max-w-2xl">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search />
                    </span>
                    <Input
                        placeholder="Search posts..."
                        onChange={(e) => setSearchQuery(e.target.value)}
                        value={searchQuery}
                        className="border p-2 pl-10 flex-grow rounded bg-white/30 dark:bg-black/30 border border-gray-800/30 dark:border-gray-400/30 text-gray-700 hover:bg-white/50 dark:text-gray-300 dark:hover:bg-gray-800/50 transition-colors duration-500 transition-ease-in-out"
                    />
                </div>
                <Button onClick={handleSearch} className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
                    Search
                </Button>
            </div>

            <div className="flex mb-4 space-x-2 items-center">
                <TagCombobox selectedTags={tags} setSelectedTags={setTags} />
            </div>

            <div
                className={
                    displayMode === 'card'
                        ? 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 pt-5'
                        : 'flex flex-col space-y-4 pt-5'
                }
            >
                {posts.length > 0 ? (
                    <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {posts.map(post => (
                                <PostItem
                                    key={post.id}
                                    id={post.id}
                                    title={post.title}
                                    description={post.description}
                                    layout={displayMode}
                                    rating={post.rating}
                                />
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
                    <p>No posts found</p>
                )}
            </div>
        </div>
    );
};

export default PostsIndex;
