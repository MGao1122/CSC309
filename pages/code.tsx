import React, { useState, useEffect } from 'react';
import CodeEditor from '@/components/CodeEditor';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Command, CommandInput, CommandList, CommandItem, CommandEmpty, CommandGroup } from '@/components/ui/command';
import { Card } from '@/components/ui/card';
import { Check, ChevronsUpDown } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';


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

const languages = Object.keys(languageMap).map((key) => ({
    value: key,
    label: key.charAt(0).toUpperCase() + key.slice(1), // Capitalize language names
}));

const Code: React.FC = () => {

    const [selectedLanguage, setSelectedLanguage] = useState<string>('python');
    const [input, setInput] = useState<string>('');
    const [content, setContent] = useState<string>('');
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [output, setOutput] = useState<{ stdout: string; stderr: string; exitCode: number } | null>(null);



    const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setInput(e.target.value);
    };

    const handleRunCode = async () => {
        if (!content) return;
        setIsLoading(true);
        try {
            const response = await fetch('/api/code', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    code: content,
                    language: selectedLanguage,
                    input: input,
                }),
            });
            const data = await response.json();
            setOutput({ stdout: data.stdout, stderr: data.stderr, exitCode: data.exitCode });
        } catch (error) {
            console.error('Error running code:', error);
            setOutput({ stdout: '', stderr: 'Failed to execute code', exitCode: 1 });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="container mx-auto px-2 py-2">
            <Card className="container mx-auto px-4 pb-2">
                <h2 className="font-semibold mb-4  mt-4">Code Editor</h2>
                {/* Language Selector using Command and Popover */}
                <div className="mb-6">
                    <label className="text-sm font-medium text-gray-700 mb-2 block">Select Language:</label>
                    <Popover open={isOpen} onOpenChange={setIsOpen}>
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
                        <PopoverContent className="w-[200px] p-0 popover-content">
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
                    content={content}
                    language={languageMap[selectedLanguage] || 'plaintext'}
                    onChange={(value) => setContent(value)}
                    // set the theme dynamically based on current theme
                    theme={'vs-dark'}
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

                <Button onClick={handleRunCode} disabled={isLoading} className="mt-4 mb-2">
                    {isLoading ? 'Running...' : 'Run'}
                </Button>

                {output && (
                    <div className="my-2">
                        <h3 className="text-lg font-medium">Output</h3>
                        <div className="border border-gray-300 dark:border-gray-800 bg-gray-100 dark:bg-gray-900 p-4 mt-2 rounded-md max-h-48 overflow-y-auto">
                            <strong>stdout:</strong>
                            <pre className="whitespace-pre-wrap">{output.stdout || 'No output'}</pre>
                            <strong>stderr:</strong>
                            <pre className="whitespace-pre-wrap text-red-500">{output.stderr || 'No errors'}</pre>
                            {/* <strong>exit code:</strong> */}
                            {/* <pre>{output.exitCode}</pre> */}
                        </div>
                    </div>
                )}
            </Card>
        </div>
    )
}

export default Code;