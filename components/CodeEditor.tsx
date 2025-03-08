import React from 'react';
import MonacoEditor from '@monaco-editor/react';

interface CodeEditorProps {
    content: string;
    language: string;
    theme: 'vs-dark' | 'vs-light';
    onChange: (newContent: string) => void;
    readOnly?: boolean;
}

const CodeEditor: React.FC<CodeEditorProps> = ({ content, language, theme, onChange, readOnly = false }) => {
    return (
        <MonacoEditor
            value={content}
            language={language}
            theme='vs-dark'
            onChange={(value) => onChange(value || '')}
            options={{
                automaticLayout: true,
                minimap: { enabled: false }, // Optional: disable minimap for a cleaner view
                readOnly
            }}
            height="40rem"
            width="100%"
            className='rounded-lg border p-2 bg-vscodedark'
        />
    );
};

export default CodeEditor;
