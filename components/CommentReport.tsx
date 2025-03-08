import Link from "next/link";

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

interface CommentReportsProps {
    comments: {
        results: Comment[];
        page: number;
        perPage: number;
        totalPages: number;
    };
}

const CommentReports: React.FC<CommentReportsProps> = ({ comments }) => {
    return (
        <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {comments.results.map((comment) => (
                <Link key={comment.id} href={`/admin/comment/${comment.id}?reportId=${comment.report[0].id}`} passHref>
                    <div
                        className="border border-gray-300 rounded-lg p-4 shadow-md hover:shadow-lg hover:scale-105 transition-transform cursor-pointer"
                    >
                        <p className="text-sm text-gray-800 mb-4">Content: {comment.content}</p>
                        <div className="text-sm text-gray-500">
                            <p>Author ID: {comment.authorId}</p>
                            <p>Blog Post ID: {comment.blogPostId}</p>
                            <p>
                                Visibility:{" "}
                                <span
                                    className={`${comment.visibility ? "text-green-600" : "text-red-600"
                                        }`}
                                >
                                    {comment.visibility ? "Visible" : "Hidden"}
                                </span>
                            </p>
                            <p>Reports: {comment.reportCount}</p>
                        </div>
                    </div>
                </Link>
            ))}
        </div>
    );
};

export default CommentReports;
