import Link from "next/link";

interface Post {
    id: number;
    title: string;
    description: string | null;
    authorId: number;
    visibility: boolean;
    reportCount: number;
    report: Report[];
}

interface Report {
    id: number;
}

interface PostReportsProps {
    posts: {
        results: Post[];
        page: number;
        perPage: number;
        totalPages: number;
    };
}

const PostReports: React.FC<PostReportsProps> = ({ posts }) => {
    return (
        <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.results.map((post) => (
                <Link key={post.id} href={`/admin/post/${post.id}?reportId=${post.report[0].id}`} passHref>
                    <div
                        className="border border-gray-300 rounded-lg p-4 shadow-md hover:shadow-lg hover:scale-105 transition-transform cursor-pointer"
                    >
                        <h3 className="text-lg font-semibold mb-2">{post.title}</h3>
                        <p className="text-sm text-gray-600 mb-4">
                            {post.description || "No description available."}
                        </p>
                        <div className="text-sm text-gray-500">
                            <p>Author ID: {post.authorId}</p>
                            <p>
                                Visibility:{" "}
                                <span
                                    className={`${post.visibility ? "text-green-600" : "text-red-600"
                                        }`}
                                >
                                    {post.visibility ? "Visible" : "Hidden"}
                                </span>
                            </p>
                            <p>Reports: {post.reportCount}</p>
                        </div>
                    </div>
                </Link>
            ))}
        </div>
    );
};

export default PostReports;
