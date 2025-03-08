import React, { useState, useEffect } from 'react';
import { Comment } from './Comment';
import axios from 'axios';
import api from '@/services/authService';
import { useAuth } from '@/context/AuthContext';
import { Button } from './ui/button';
import { Minus } from 'lucide-react';

interface CommentHolderProps {
    id: string;
    root: boolean;
}

interface Comment {
    id: number;
    content: string;
    authorId: number;
    blogId: number;
    childrenCount: number;
    rating: number;
}

const CommentHolder: React.FC<CommentHolderProps> = ({ id, root = false }) => {

    const [comments, setComments] = useState<Comment[]>([]);
    const [page, setPage] = useState<number>(1);
    const [totalPages, setTotalPages] = useState<number>(1);
    const perPage = root ? 10 : 3;

    const { user } = useAuth();


    useEffect(() => {
        // Fetch comments
        fetchComments();
    }, [page]);

    const fetchComments = async () => {
        try {
            let response;
            if (root) {
                response = await axios.get(`http://localhost:3000/api/comment?postId=${id}`, {
                    params: { page, perPage }
                });
            } else {
                response = await axios.get(`http://localhost:3000/api/comment/${id}`, {
                    params: { page, perPage }
                });
            }
            // extend the current comments with the new comments
            setComments([...comments, ...response.data.results]);
            setTotalPages(response.data.totalPages);
        } catch (error) {
            console.error('Error fetching comments:', error);
        }
    };


    return (
        <div className="border-l-2 border-gray-300 pl-4">
            {comments.map((comment) => (
                <Comment key={comment.id} self={comment} />
            ))}
            {page < totalPages && (
                <Button variant='link' onClick={() => setPage(page + 1)}><Minus />Show more<Minus /></Button>
            )}
        </div>
    );
};

export default CommentHolder;