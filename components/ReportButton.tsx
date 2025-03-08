import React, { useState } from 'react';
import { Flag } from 'lucide-react';
import { Button } from "./ui/button";
import { Input } from './ui/input';
import api from '@/services/authService';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
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

interface ReportButtonProps {
    id: number;
    type: string;
    className?: string;
}

export function ReportButton({ id, type, className="" }: ReportButtonProps) {
    const [content, setContent] = useState<string>("");
    const [reported, setReported] = useState<boolean>(false);

    const handleSubmit = async () => {
        await api.post(`/report/${type}/${id}`, { content });
        setReported(true);
    };

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button variant="destructive" className={className}><Flag />Report</Button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
                <div className="grid gap-4">
                    <div className="space-y-2">
                        <h4 className="font-medium leading-none">Report</h4>
                        <p className="text-sm text-green-500 text-muted-foreground">
                            {reported && "Your report has been submitted."}
                        </p>
                    </div>
                    {!reported && (
                        <div className="grid gap-2">
                            <div className="grid grid-cols-3 items-center gap-4">
                                <Input
                                    id="description"
                                    value={content}
                                    onChange={(e) => setContent(e.target.value)}
                                    className="col-span-3 h-8"
                                    placeholder='Describe the inappropriate content.'
                                />
                            </div>
                            <Button onClick={handleSubmit} size="sm" className='w-20 mt-2'>Submit</Button>
                        </div>
                    )}

                </div>
            </PopoverContent>
        </Popover>
    );
}
