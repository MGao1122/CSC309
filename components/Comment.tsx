import React, { useEffect, useState } from "react";
import Router, { useRouter } from 'next/router';
import { Button } from "./ui/button";
import User from "./User";
import CommentHolder from "./CommentHolder";
import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerDescription,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
} from "@/components/ui/drawer"
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
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { ReportCommentButton } from "./ReportCommentButton";
import { Input } from "./ui/input";
import { Toggle } from "./ui/toggle";
import { ThumbsUp, ThumbsDown, ChevronsDown, ChevronUp, Trash2 } from "lucide-react";
import { AuthProvider, useAuth } from "../context/AuthContext";
import api from "../services/authService";

interface Comment {
    id: number;
    content: string;
    authorId: number;
    blogId: number;
    childrenCount: number;
    rating: number;
}

interface CommentProps {
    self: Comment;
}

interface RatingPayload {
    upvote: boolean;
    downvote: boolean;
}

export const Comment: React.FC<CommentProps> = ({ self }) => {

    const [showReplies, setShowReplies] = React.useState<boolean>(false);
    const [replying, setReplying] = React.useState<boolean>(false);
    const [replyContent, setReplyContent] = React.useState<string>("");
    const [isUpvoted, setIsUpvoted] = useState(false);
    const [isDownvoted, setIsDownvoted] = useState(false);
    const [comment, setComment] = useState(self);
    const [deleted, setDeleted] = useState(false);

    const { user } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (user) {
            fetchUserVote();
        }
    }, [user]);

    const fetchUserVote = async () => {
        try {
            const response = await api.get(`/find/comment/vote/${comment.id}`);
            if (response.data) {
                console.log(response.data);
                setIsUpvoted(response.data.upvoted);
                setIsDownvoted(response.data.downvoted);
            }
        } catch (error) {
            console.error('Error fetching user vote:', error);
        }
    }

    const reply = async () => {
        try {
            setShowReplies(false);
            const response = await api.post(`/comment/auth/${comment.id}`, { content: replyContent });
            console.log(response.data);
            setReplying(false);
            setReplyContent("");
            comment.childrenCount++;
            setShowReplies(true);
        } catch (error) {
            console.error('Error replying:', error);
        }
    };

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
            const response = await api.put(`/comment/auth/${comment.id}`, payload);

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

            if (comment) {
                comment.rating = response.data.rating;
                setComment(comment);
            }
        } catch (error) {
            console.error('Error changing rating:', error);
        }
    };

    const handleDelete = async () => {
        try {
            await api.delete(`/comment/auth/${comment.id}`);
            setDeleted(true);
        } catch (error) {
        }
    };

    return !deleted && (
        <div className="ml-2 mt-4 mb-4">
            <div className="flex items-center">
                <User id={self.authorId} />
            </div>

            <h4 className="ml-12 break-words text-sm">{self.content}</h4>

            <div className="flex items-center mt-2">
                <div className="flex items-center space-x-2">
                    <Toggle
                        size='sm'
                        pressed={isUpvoted}
                        onPressedChange={() => changeRating(!isUpvoted, false)}
                        disabled={!user}
                        className=""
                    >
                        <ThumbsUp />
                    </Toggle>
                    <span className="text-md font-bold">{comment?.rating}</span>
                    <Toggle
                        size='sm'
                        pressed={isDownvoted}
                        onPressedChange={() => {
                            changeRating(false, !isDownvoted);
                        }}
                        disabled={!user}
                        className=""
                    >
                        <ThumbsDown />
                    </Toggle>
                </div>

                <div className="flex items-center ml-2">
                    <Drawer>
                        {user ? (
                            <DrawerTrigger>
                                <Button variant="outline" size='sm'>Reply</Button>
                            </DrawerTrigger>
                        ) : (
                            <Popover>
                                <PopoverTrigger>
                                    <Button variant="outline" size='sm'>Reply</Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-300">
                                    <Button onClick={() => router.push('/login')} variant='link' size='icon'>Login</Button> to reply
                                </PopoverContent>
                            </Popover>
                        )}
                        <div className="flex flex-col justify-center items-center w-full">
                            <DrawerContent>
                                <DrawerHeader>
                                    <div className="flex flex-col justify-center items-center w-full space-y-4 mb-8">
                                        <DrawerTitle>Replying to</DrawerTitle>
                                        <DrawerDescription>
                                            <div className="items-center">
                                                <User id={self.authorId} />
                                                <h4 className="ml-12 text-md break-all">{self.content}</h4>
                                            </div>
                                        </DrawerDescription>
                                        <Input
                                            placeholder="Reply..."
                                            value={replyContent}
                                            onChange={(e) => setReplyContent(e.target.value)}
                                            className="w-full sm:w-3/4 md:w-1/2 lg:w-1/3 xl:w-1/4 px-4 py-2 border"
                                        />
                                    </div>
                                </DrawerHeader>
                                <DrawerFooter>
                                    <DrawerClose>
                                        <div className="flex justify-center items-center w-full space-x-4 mb-8">
                                            <Button onClick={reply}>Send</Button>
                                            <Button variant="outline">Cancel</Button>
                                        </div>
                                    </DrawerClose>
                                </DrawerFooter>
                            </DrawerContent>
                        </div>
                    </Drawer>

                    {/* Report or Delete Button */}
                    {user && user.id !== comment.authorId && (
                        <ReportCommentButton id={self.id} type="comment" className="ml-0"></ReportCommentButton>
                    )}
                    {user && user.id === comment.authorId && (
                        <AlertDialog>
                            <AlertDialogTrigger>
                                <Button variant="link" size="sm"><Trash2 color="#ff0000" /></Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Warning</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        This action cannot be revoked. Do you want to delete your comment permanently?
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90"><Trash2 />Delete</AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    )}
                </div>
            </div>

            {self.childrenCount > 0 && (
                <div>
                    {!showReplies && <Button
                        variant='link'
                        onClick={() => setShowReplies(true)}
                    >
                        <ChevronsDown />View {self.childrenCount} {self.childrenCount === 1 ? 'reply' : 'replies'}
                    </Button>}
                </div>
            )}

            {showReplies && (
                <div className="ml-4">
                    <CommentHolder id={self.id.toString()} root={false} />
                    <Button variant='link' onClick={() => setShowReplies(false)}><ChevronUp />Hide</Button>
                </div>
            )}

        </div>
    );
}
