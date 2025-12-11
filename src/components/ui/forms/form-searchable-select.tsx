"use client";

import * as React from "react";
import { Controller, useFormContext, useFormState } from "react-hook-form";
import { Check, ChevronsUpDown } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { getFieldError } from "./form-errors";

interface FormSearchableSelectProps {
    name: string;
    label: string;
    placeholder?: string;
    searchPlaceholder?: string;
    options: string[];
    emptyMessage?: string;
}

export function FormSearchableSelect({
    name,
    label,
    placeholder = "Select...",
    searchPlaceholder = "Search...",
    options,
    emptyMessage = "No option found.",
}: FormSearchableSelectProps) {
    const { control } = useFormContext();
    const { errors } = useFormState({ control, name });
    const error = getFieldError(errors, name)?.message as string | undefined;

    return (
        <div className="space-y-1">
            <Label htmlFor={name}>{label}</Label>
            <Controller
                name={name}
                control={control}
                render={({ field: { onChange, value } }) => {
                    const [open, setOpen] = React.useState(false);

                    return (
                        <Popover open={open} onOpenChange={setOpen}>
                            <PopoverTrigger asChild>
                                <Button
                                    id={name}
                                    variant="outline"
                                    role="combobox"
                                    aria-expanded={open}
                                    className={cn(
                                        "w-full justify-between font-normal",
                                        !value && "text-muted-foreground"
                                    )}
                                >
                                    {value || placeholder}
                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-full p-0" align="start">
                                <Command>
                                    <CommandInput placeholder={searchPlaceholder} className="h-9" />
                                    <CommandList>
                                        <CommandEmpty>{emptyMessage}</CommandEmpty>
                                        <CommandGroup>
                                            {options.map((option) => (
                                                <CommandItem
                                                    key={option}
                                                    value={option}
                                                    onSelect={(currentValue) => {
                                                        // Find the exact match from options (case-insensitive search returns lowercase)
                                                        const selectedOption = options.find(
                                                            opt => opt.toLowerCase() === currentValue.toLowerCase()
                                                        ) || currentValue;
                                                        onChange(selectedOption === value ? "" : selectedOption);
                                                        setOpen(false);
                                                    }}
                                                >
                                                    {option}
                                                    <Check
                                                        className={cn(
                                                            "ml-auto h-4 w-4",
                                                            value === option ? "opacity-100" : "opacity-0"
                                                        )}
                                                    />
                                                </CommandItem>
                                            ))}
                                        </CommandGroup>
                                    </CommandList>
                                </Command>
                            </PopoverContent>
                        </Popover>
                    );
                }}
            />
            {error && <p className="text-sm text-red-500">{error}</p>}
        </div>
    );
}
