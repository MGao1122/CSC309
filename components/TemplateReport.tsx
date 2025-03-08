import Link from "next/link";

interface Template {
    id: number;
    title: string;
    description: string | null;
    content: string;
    authorId: number;
    visibility: boolean;
    reportCount: number;
    report: Report[];
}

interface Report {
    id: number;
}

interface TemplateReportsProps {
    templates: {
        results: Template[];
        page: number;
        perPage: number;
        totalPages: number;
    };
}

const TemplateReports: React.FC<TemplateReportsProps> = ({ templates }) => {
    return (
        <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {templates.results.map((template) => (
                <Link key={template.id} href={`/admin/template/${template.id}?reportId=${template.report[0].id}`} passHref>
                    <div
                        className="border border-gray-300 rounded-lg p-4 shadow-md hover:shadow-lg hover:scale-105 transition-transform cursor-pointer"
                    >
                        <h3 className="text-lg font-semibold mb-2">{template.title}</h3>
                        <p className="text-sm text-gray-600 mb-4">
                            {template.description || "No description available."}
                        </p>
                        <div className="text-sm text-gray-500">
                            <p>Author ID: {template.authorId}</p>
                            <p>
                                Visibility:{" "}
                                <span
                                    className={`${template.visibility ? "text-green-600" : "text-red-600"
                                        }`}
                                >
                                    {template.visibility ? "Visible" : "Hidden"}
                                </span>
                            </p>
                            <p>Reports: {template.reportCount}</p>
                        </div>
                    </div>
                </Link>
            ))}
        </div>
    );
};

export default TemplateReports;
