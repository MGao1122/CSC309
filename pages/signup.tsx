// pages/signup.tsx
import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { cn } from '@/lib/utils';
import Background from '@/components/Background';
import FrostedGlass from '@/components/FrostedGlass';

import { useEffect } from 'react';

type FormInputs = {
    username: string;
    email: string;
    password: string;
    confirmPassword: string;
    firstName: string;
    lastName: string;
    phone: string;
}

const formSchema = z.object({
    username: z.string().min(2, {
        message: "Username must be at least 2 characters.",
    }).max(30, {
        message: "Username is at most 40 characters."
    }),
    email: z.string().email({
        message: "Invalid email address.",
    }),
    password: z.string().min(6, {
        message: "Password must be at least 6 characters.",
    }),
    confirmPassword: z.string().min(6, {
        message: "Confirm password must be at least 6 characters.",
    }),
    firstName: z.string().min(1, {
        message: "First name is required.",
    }).max(20, {
        message: "First name is at most 20 characters."
    }),
    lastName: z.string().min(1, {
        message: "Last name is required.",
    }).max(20, {
        message: "Last name is at most 20 characters."
    }),
    phone: z.string()
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
})

export function SignupForm() {
    const [serverError, setServerError] = useState("");
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            username: "",
            email: "",
            password: "",
            confirmPassword: "",
            firstName: "",
            lastName: "",
            phone: "",
        },
    })

    const router = useRouter();

    const onSubmit = async (values: FormInputs) => {
        try {
            const response = await fetch('http://localhost:3000/api/users/signup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(values),
            })

            if (response.ok) {
                router.push('/login') // Redirect to login page on success
            } else {
                const errorData = await response.json();
                if (errorData.error === "Username should be unique") {
                    form.setError("username", { type: "manual", message: "Username should be unique" });
                } else if (errorData.error === "Email should be unique") {
                    form.setError("email", { type: "manual", message: "Email should be unique" });
                } else if (errorData.error === "Username and Email should be unique") {
                    form.setError("username", { type: "manual", message: "Username should be unique" });
                    form.setError("email", { type: "manual", message: "Email should be unique" });
                } else {
                    setServerError(errorData.error || "An unknown error occurred.");
                }
            }
        } catch (error) {
            setServerError("An error occurred. Please try again later.");
        }
    }

    return (
        <div className="flex items-center justify-center bg-none transition duration-300 px-2 py-2 overflow-y-auto">
            <FrostedGlass className={cn("w-full max-w-md sm:max-w-lg md:max-w-xl lg:max-w-2xl")}>
                <CardHeader>
                    <CardTitle>Sign Up</CardTitle>
                    <CardDescription>{serverError && (
                        <div className="text-red-600 font-bold">{serverError}</div>
                    )}</CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">

                            <FormField
                                control={form.control}
                                name="username"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Username</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Username" {...field} className='bg-white/40 dark:bg-black/40 inputT' />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Email</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Email" type="email" {...field} className='bg-white/40 dark:bg-black/40 inputT' />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="password"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Password</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Password" type="password" {...field} className='bg-white/40 dark:bg-black/40 inputT' />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="confirmPassword"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Confirm Password</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Confirm Password" type="password" {...field} className='bg-white/40 dark:bg-black/40 inputT' />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="firstName"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>First Name</FormLabel>
                                        <FormControl>
                                            <Input placeholder="First Name" {...field} className='bg-white/40 dark:bg-black/40 inputT' />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="lastName"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Last Name</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Last Name" {...field} className='bg-white/40 dark:bg-black/40 inputT' />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="phone"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Phone</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Optional" {...field} className='bg-white/40 dark:bg-black/40 inputT' />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <div className='flex justify-between'>
                                <Button type="submit">Sign Up</Button>
                                <Button type='button' variant='link' onClick={() => router.push('/login')}>Already have an account? Log in</Button>
                            </div>
                        </form>
                    </Form>
                </CardContent>
            </FrostedGlass>
        </div>
    );
}

export default SignupForm;
