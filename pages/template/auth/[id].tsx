// pages/template/[id].tsx
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { Trash2 } from 'lucide-react';
import { TriangleAlert } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Command, CommandInput, CommandList, CommandItem, CommandEmpty, CommandGroup } from '@/components/ui/command';
import { Check, ChevronsUpDown } from "lucide-react";
import Tag from '@/components/Tag';
import api from '@/services/authService';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/context/AuthContext';
import User from '@/components/User';
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
import { Card } from '@/components/ui/card';

// Dynamically import CodeEditor with SSR disabled
const CodeEditor = dynamic(() => import('../../../components/CodeEditor'), { ssr: false });

type Template = {
    id: number;
    title: string;
    description: string | null;
    content: string;
    language: string;
    parentTemplate: Template | null;
    visibility: boolean;
    authorId: number;
};

// Map selected language to Monaco Editor language identifier
const languageMap: { [key: string]: string } = {
    python: 'python',
    javascript: 'javascript',
    java: 'java',
    cpp: 'cpp',
    c: 'c',
    ruby: 'ruby',
    php: 'php',
    go: 'go',
    rust: 'rust',
    perl: 'perl',
    r: 'r',
    haskell: 'haskell',
};

// Language options for the combobox
const languages = Object.keys(languageMap).map((key) => ({
    value: key,
    label: key.charAt(0).toUpperCase() + key.slice(1), // Capitalize language names
}));

const TemplatePage: React.FC = () => {
    const router = useRouter();
    const { id } = router.query;

    const [template, setTemplate] = useState<Template | null>(null);
    const [selectedLanguage, setSelectedLanguage] = useState<string>('python');
    const [input, setInput] = useState<string>('');
    const [output, setOutput] = useState<{ stdout: string; stderr: string } | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [error, setError] = useState<string | null>(null); // Error state
    const [countdown, setCountdown] = useState(5);

    const [tags, setTags] = useState<string[]>([]);
    const [showMore, setShowMore] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const tagsPerPage = 5; <p className='text-red-500'>Hidden</p>
    const [totalPages, setTotalPages] = useState(1);

    const [isContentChanged, setIsContentChanged] = useState(false);
    const [isSaveModalOpen, setIsSaveModalOpen] = useState(false); // Controls the popup visibility
    const [isLanguageChanged, setIsLanguageChanged] = useState(false);

    const { user } = useAuth();

    const [allTags, setAllTags] = useState<string[]>([]); // State to store all tags

    useEffect(() => {
        const fetchTemplate = async () => {
            if (id) {
                try {
                    const response = await api.get(`/template/auth/${id}`);
                    setTemplate(response.data);
                    setSelectedLanguage(response.data.language);
                } catch (error) {
                    setError('Failed to fetch template');
                }
            }
        };

        fetchTemplate();
    }, [id, router]);

    useEffect(() => {
        if (error) {
            const interval = setInterval(() => {
                setCountdown((prev) => prev - 1);
            }, 1000);

            // Redirect after countdown reaches 0
            if (countdown <= 0) {
                clearInterval(interval);
                router.push('/');
            }

            // Clean up the interval on unmount
            return () => clearInterval(interval);
        }
    }, [error, countdown, router]);

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="bg-red-500 text-white p-6 rounded-md shadow-md text-center min-w-[50%]">
                    <p className="text-xl font-semibold">Error</p>
                    <p className="mt-2">{error}</p>
                    <p className="mt-4 text-sm">
                        Redirecting to the home page in {countdown} seconds...
                    </p>
                </div>
            </div>
        );
    }

    const handleContentChange = (newContent: string) => {
        setTemplate(prev => (prev ? { ...prev, content: newContent } : null));
        setIsContentChanged(true);
    };

    const handleInputChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        setInput(event.target.value);
    };

    const saveCode = async () => {
        const data = {
            content: template?.content,
            language: selectedLanguage,
        }

        try {
            await api.put(`http://localhost:3000/api/template/auth/${id}`, data);
            setIsContentChanged(false);
            setIsLanguageChanged(false);
        } catch (error) {
            console.error('Error saving code:', error);
        }
    }

    const handleRunCode = async () => {
        if (!template) return;
        setIsLoading(true);
        try {
            const response = await fetch('/api/code', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    code: template.content,
                    language: selectedLanguage,
                    input: input,
                }),
            });
            const data = await response.json();
            setOutput({ stdout: data.stdout, stderr: data.stderr });
        } catch (error) {
            console.error('Error running code:', error);
            setOutput({ stdout: '', stderr: 'Failed to execute code' });
        } finally {
            setIsLoading(false);
        }
    };

    const [isLoadingTags, setIsLoadingTags] = useState(false); // State for loading tags

    const fetchTags = async (page: number) => {
        try {
            const response = await fetch(`/api/find/template/tags/${id}?page=${page}&perPage=${tagsPerPage}`);
            const data = await response.json();
            if (data.results && data.results.tags) {
                setTags((prevTags) => [...prevTags, ...data.results.tags.map((tag: { name: string }) => tag.name)]);
                setTotalPages(data.totalPages); // Set total pages from the response
            }
        } catch (error) {
            console.error('Error fetching tags:', error);
        }
    };

    const [saveData, setSaveData] = useState({
        title: template?.title || "",
        description: template?.description || "",
        content: template?.content || "",
        language: template?.language || "python",
        parent: template?.parentTemplate || null,
    });


    const [tagInput, setTagInput] = useState("");   // State for current tag input

    const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" && tagInput.trim()) {
            e.preventDefault();

            // check if the tag already exists
            if (allTags.includes(tagInput.trim())) {
                setTagInput(""); // Clear the input
                return;
            }
            setAllTags((prevTags) => [...prevTags, tagInput.trim()]); // Add the new tag
            setTagInput(""); // Clear the input
        }
    };

    const handleRemoveTag = (tagToRemove: string) => {
        setAllTags((prevTags) => prevTags.filter((tag) => tag !== tagToRemove)); // Remove the selected tag
    };

    const handleUpdateTemplate = async (event: React.FormEvent) => {
        event.preventDefault();

        const formattedTags = allTags.map((tag) => ({ name: tag })); // Format tags as required by the API

        const updatePayload = {
            title: saveData.title,
            description: saveData.description,
            content: template?.content,
            language: selectedLanguage,
            tags: formattedTags, // Include the formatted tags
        };

        try {
            await api.put(`http://localhost:3000/api/template/auth/${id}`, updatePayload);

            setIsContentChanged(false);
            setIsUpdateModalOpen(false);
            let newTags = allTags;
            setTags(newTags);

            let newTemplate = template;
            if (newTemplate) {
                newTemplate.title = saveData.title;
                newTemplate.description = saveData.description;
                newTemplate.language = selectedLanguage;
                setTemplate(newTemplate);
            }

        } catch (error) {
            console.error('Error updating template:', error);
        }
    }

    const handleSaveTemplate = async (event: React.FormEvent) => {
        event.preventDefault();

        const formattedTags = allTags.map((tag) => ({ name: tag })); // Format tags as required by the API

        const savePayload = {
            title: saveData.title,
            description: saveData.description,
            content: template?.content,
            language: template?.language,
            tags: formattedTags, // Include the formatted tags
            parent: template?.id,
        };

        try {
            await api.post('http://localhost:3000/api/template/auth', savePayload);

            setIsContentChanged(false);
            setIsSaveModalOpen(false);
            setTags(allTags);
        } catch (error) {
            console.error('Error saving template:', error);
        }
    };

    useEffect(() => {
        if (id) {
            fetchTags(1); // Fetch the first page of tags
        }
    }, [id]);

    const handleShowMore = () => {
        const nextPage = currentPage + 1;
        setCurrentPage(nextPage);
        fetchTags(nextPage); // Fetch tags for the next page only on button click
    };

    const [popoutPage, popoutPageSet] = useState(0); // State to store the current page for popout

    const fetchAllTagsForPopout = async () => {
        // Check if all tags are already loaded
        if (currentPage >= totalPages) {
            setAllTags(tags); // Set all tags to the existing tags
            setIsSaveModalOpen(true); // Open the modal directly if all tags are already loaded
            return;
        }

        setIsLoadingTags(true); // Set loading state to true
        let page = currentPage; // Start from the current page
        let allTags = [...tags]; // Clone existing tags

        try {
            if (popoutPage === totalPages) {
                return;
            }
            while (page <= totalPages) {
                const response = await fetch(`/api/find/template/tags/${id}?page=${page}&perPage=${tagsPerPage}`);
                const data = await response.json();

                if (data.results && data.results.tags) {
                    const fetchedTags = data.results.tags.map((tag: { name: string }) => tag.name);
                    allTags = [...allTags, ...fetchedTags];

                    // Update state with newly fetched tags
                    setAllTags(allTags);

                    // Update totalPages based on the API response
                    setTotalPages(data.totalPages);
                }

                // Increment to the next page
                page += 1;
            }
        } catch (error) {
            console.error('Error fetching all tags:', error);
        } finally {
            setIsLoadingTags(false); // Set loading state to false
            setIsSaveModalOpen(true); // Open the modal after all tags are loaded
            // setCurrentPage(page - 1); // Update current page to the last fetched page
            popoutPageSet(page - 1);
        }
    };

    const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false); // Controls the popup visibility

    const fetchAllTagsForPopoutUpdate = async () => {
        saveData.title = template?.title || "";
        saveData.description = template?.description || "";
        // Check if all tags are already loaded
        if (currentPage >= totalPages) {
            setAllTags(tags); // Set all tags to the existing tags
            setIsUpdateModalOpen(true); // Open the modal directly if all tags are already loaded
            return;
        }

        setIsLoadingTags(true); // Set loading state to true
        let page = currentPage; // Start from the current page
        let allTags = [...tags]; // Clone existing tags

        try {
            if (popoutPage === totalPages) {
                return;
            }
            while (page <= totalPages) {
                const response = await fetch(`/api/find/template/tags/${id}?page=${page}&perPage=${tagsPerPage}`);
                const data = await response.json();

                if (data.results && data.results.tags) {
                    const fetchedTags = data.results.tags.map((tag: { name: string }) => tag.name);
                    allTags = [...allTags, ...fetchedTags];

                    // Update state with newly fetched tags
                    setAllTags(allTags);

                    // Update totalPages based on the API response
                    setTotalPages(data.totalPages);
                }

                // Increment to the next page
                page += 1;
            }
        } catch (error) {
            console.error('Error fetching all tags:', error);
        } finally {
            setIsLoadingTags(false); // Set loading state to false
            setIsUpdateModalOpen(true); // Open the modal after all tags are loaded
            // setCurrentPage(page - 1); // Update current page to the last fetched page
            popoutPageSet(page - 1);
        }
    };

    const handleDelete = async () => {
        try {
            await api.delete(`http://localhost:3000/api/template/auth/${id}`);
            router.push('/');
        } catch (error) {
            console.error('Error deleting template:', error);
        }
    };


    if (!template) return <p>Loading...</p>;

    return (
        <div className="container px-2 py-2">
            <Card className="container mx-auto p-4 max-w-screen">
                <h1 className="text-4xl font-semibold m-2 mb-2 break-words">{template.title}</h1>
                <div className="mb-4 ml-2 mr-4">
                    <div className="mt-2">
                        {tags.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-2">
                                {tags.map((tag, index) => (
                                    <Tag key={index} name={tag} />
                                ))}

                                {/* Show More Button Styled as Tag */}
                                {currentPage < totalPages && (
                                    <button
                                        onClick={handleShowMore}
                                        className="inline-flex items-center px-3 py-1 rounded-full bg-gray-300 dark:bg-gray-500 text-gray-800 text-sm font-medium cursor-pointer"
                                    >
                                        Show More
                                    </button>
                                )}
                            </div>
                        )}
                    </div>

                    <div className='ml-2 mr-4 mb-4'>
                        {template && (<User id={template.authorId}></User>)}
                    </div>

                </div>
                <h3 className='text-red-500 flex items-center m-4'>
                    <TriangleAlert className="mr-4" />
                    This template violates the community regulation and has been hidden.
                </h3>

                <div className='ml-2 mr-4 break-words'>
                    {template.description && <h4 className="ml-2 mt-2 text-lg">{template.description}</h4>}
                </div>



                {/* Display fork information and link to the parent template if available */}
                <div className='ml-2 mr-4'>
                    {template.parentTemplate && (
                        <p className="text-gray-900 mb-6">
                            This template is forked from <Button variant='link' onClick={() => router.push(`/template/${template.parentTemplate?.id}`)}>{template.parentTemplate.title}</Button>
                        </p>
                    )}
                </div>

                {/* Language Selector using Command and Popover */}
                <div className="mb-6 m-4 ml-2">
                    <label className="text-sm font-medium text-gray-700 mb-2 block">Select Language:</label>
                    <Popover open={isOpen}>
                        <PopoverTrigger asChild>
                            <Button
                                variant="outline"
                                role="combobox"
                                aria-expanded={isOpen}
                                className="w-[200px] flex justify-between items-center"
                            >
                                {selectedLanguage
                                    ? languages.find((lang) => lang.value === selectedLanguage)?.label
                                    : "Select language..."}
                                <ChevronsUpDown className="opacity-50" />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[200px] p-0">
                            <Command>
                                <CommandInput placeholder="Search language..." />
                                <CommandList>
                                    <CommandEmpty>No language found.</CommandEmpty>
                                    <CommandGroup>
                                        {languages.map((lang) => (
                                            <CommandItem
                                                key={lang.value}
                                                value={lang.value}
                                                onSelect={() => {
                                                    setSelectedLanguage(lang.value);
                                                    setIsLanguageChanged(true);
                                                    setIsOpen(false);
                                                }}
                                            >
                                                {lang.label}
                                                <Check
                                                    className={`ml-auto ${selectedLanguage === lang.value ? "opacity-100" : "opacity-0"
                                                        }`}
                                                />
                                            </CommandItem>
                                        ))}
                                    </CommandGroup>
                                </CommandList>
                            </Command>
                        </PopoverContent>
                    </Popover>
                </div>

                <CodeEditor
                    content={template.content}
                    language={languageMap[selectedLanguage] || 'plaintext'}
                    onChange={handleContentChange}
                    readOnly={true} // Set readOnly to true to disable input
                    // set the theme dynamically based on current theme
                    theme={localStorage.getItem('theme') === 'dark' ? 'vs-dark' : 'vs-light'}
                />

                {/* Input Section */}
                <div className="mt-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Input</label>
                    <Textarea
                        value={input}
                        onChange={handleInputChange}
                        placeholder="Enter input for your code here"
                        rows={3}
                        className="w-full"
                    />
                </div>

                <div className='flex relative justify-between items-start w-full'>
                    <div className='flex space-x-4'>
                        <Button onClick={handleRunCode} disabled={isLoading} className="mt-4">
                            {isLoading ? 'Running...' : 'Run'}
                        </Button>
                    </div>

                    {user && user.id === template.authorId && (
                        <AlertDialog>
                            <AlertDialogTrigger>
                                <Button variant="destructive" className='mt-4 ml-4'><Trash2 />Delete</Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Warning</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        This action cannot be undone. This will permanently delete your account
                                        and remove your data from our servers.
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

                {output && (
                    <div className="mt-6">
                        <h3 className="text-lg font-medium">Output</h3>
                        <div className="border border-gray-300 dark:border-gray-800 bg-gray-100 dark:bg-gray-900 p-4 mt-2 rounded-md max-h-48 overflow-y-auto">
                            <strong>stdout:</strong>
                            <pre className="whitespace-pre-wrap">{output.stdout || 'No output'}</pre>
                            <strong>stderr:</strong>
                            <pre className="whitespace-pre-wrap text-red-500">{output.stderr || 'No errors'}</pre>
                        </div>
                    </div>
                )}

            </Card>
        </div>
    );
};

export default TemplatePage;
