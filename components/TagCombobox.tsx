import * as React from "react"
import axios from "axios"
import { Check, ChevronsUpDown } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"

interface TagData {
    name: string;
}

interface TagComboboxProps {
    selectedTags: string[];
    setSelectedTags: (tags: string[]) => void;
}

export function TagCombobox({ selectedTags, setSelectedTags }: TagComboboxProps) {
    const [open, setOpen] = React.useState(false)
    const [tagQuery, setTagQuery] = React.useState("")
    const [availableTags, setAvailableTags] = React.useState<TagData[]>([])
    const [tagPage, setTagPage] = React.useState(1)
    const [hasMoreTags, setHasMoreTags] = React.useState(true)

    React.useEffect(() => {
        fetchTags()
    }, [tagQuery, tagPage])

    const fetchTags = async () => {
        try {
            const response = await axios.get(`/api/find/tags`, {
                params: { query: tagQuery, page: tagPage, perPage: 10 }
            })
            const newTags = response.data.tags || []

            // Reset availableTags if starting a new search (page 1)
            setAvailableTags((prevTags) => tagPage === 1 ? newTags : [...prevTags, ...newTags])
            setHasMoreTags(response.data.page !== response.data.totalPages) // Check if there are more tags to load
        } catch (error) {
            console.error("Error fetching tags:", error)
        }
    }

    const handleTagSelection = (tagName: string) => {
        if (selectedTags.includes(tagName)) {
            setSelectedTags(selectedTags.filter((tag: string) => tag !== tagName))
        } else {
            setSelectedTags([...selectedTags, tagName])
        }
    }

    const handleTagRemoval = (tagName: string) => {
        setSelectedTags(selectedTags.filter((tag: string) => tag !== tagName))
    }

    return (
        <div>
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={open}
                        className="w-[200px] justify-between bg-white/30 dark:bg-black/30 border border-gray-800/30 dark:border-gray-400/30 text-gray-700 hover:bg-white/50 dark:text-gray-300 dark:hover:bg-gray-800/50 transition-colors duration-500 transition-ease-in-out"
                    >
                        Select tags...
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[200px] p-0 popover-content">
                    <Command>
                        <CommandInput
                            placeholder="Search tags..."
                            value={tagQuery}
                            onValueChange={(value) => {
                                setTagQuery(value)
                                setTagPage(1) // Reset to first page for new search
                            }}
                        />
                        <CommandList>
                            <CommandEmpty>No tags found.</CommandEmpty>
                            <CommandGroup>
                                {availableTags.map((tag) => (
                                    <CommandItem
                                        key={tag.name}
                                        value={tag.name}
                                        onSelect={() => handleTagSelection(tag.name)}
                                    >
                                        <Check
                                            className={cn(
                                                "mr-2 h-4 w-4",
                                                selectedTags.includes(tag.name) ? "opacity-100" : "opacity-0"
                                            )}
                                        />
                                        {tag.name}
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                            {hasMoreTags && availableTags.length > 0 && (
                                <div className="p-2 text-center">
                                    <Button variant="link" onClick={() => setTagPage((prev) => prev + 1)}>
                                        Load More
                                    </Button>
                                </div>
                            )}
                        </CommandList>
                    </Command>
                </PopoverContent>
            </Popover>

            {/* Display selected tags below the input with X to remove */}
            <div className="mt-2 flex items-center gap-2 flex-wrap">
                {selectedTags.map((tag, index) => (
                    <div
                        key={index}
                        className="flex items-center px-3 py-1 rounded-full bg-white dark:bg-gray-200 text-gray-800 text-sm font-medium"
                    >
                        <span>{tag}</span>
                        <button
                            type="button"
                            onClick={() => handleTagRemoval(tag)}
                            className="ml-2 text-red-500"
                        >
                            &times;
                        </button>
                    </div>
                ))}
            </div>
        </div>
    )
}

