import React, { useEffect, useState } from 'react';
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
import api from '@/services/authService';
import { useAuth } from '@/context/AuthContext';

import FrostedGlass from '@/components/FrostedGlass';
import { parse } from 'path';

type FormInputs = {
    username: string;
    email: string;
    firstName: string;
    lastName: string;
    phone: string;
    avatar?: File | null;
}


// Define maximum file size (e.g., 2MB) and accepted file types
const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
const ACCEPTED_FILE_TYPES = ["image/jpeg", "image/png"];

const formSchema = z.object({
    username: z.string().min(2, {
        message: "Username must be at least 2 characters.",
    }),
    email: z.string().email({
        message: "Invalid email address.",
    }),
    firstName: z.string().min(1, {
        message: "First name is required.",
    }),
    lastName: z.string().min(1, {
        message: "Last name is required.",
    }),
    phone: z.string(),
    avatar: z.instanceof(File).optional()
});

function encodeImageToBase64(file: File): Promise<string | ArrayBuffer | null> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = (error) => reject(error);
    });
}

function cleanBase64Data(base64String: string): string {
    // Split the string at the comma and return the second part (the Base64 data)
    return base64String.split(',')[1] || base64String;
}


export function SignupForm() {
    const [serverError, setServerError] = useState("");
    const [isBrowser, setIsBrowser] = useState(false);
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            username: "",
            email: "",
            firstName: "",
            lastName: "",
            phone: "",
            avatar: undefined,
        },
    });

    const router = useRouter();

    useEffect(() => {
        setIsBrowser(true);
    }, []);

    useEffect(() => {
        if (isBrowser && !localStorage.getItem('user')) {
            router.push("/login");
        }
    }, [isBrowser, router]);

    useEffect(() => {
        if (isBrowser) {
            const user = localStorage.getItem('user');
            if (user) {
                const parsedUser = JSON.parse(user);
                form.reset({
                    username: parsedUser.username || "",
                    email: parsedUser.email || "",
                    firstName: parsedUser.firstName || "",
                    lastName: parsedUser.lastName || "",
                    phone: parsedUser.phone || "",
                });
            }
        }
    }, [isBrowser, form]);

    const { setUser, user } = useAuth();

    const onSubmit = async (values: FormInputs) => {
        setServerError(""); // Reset error on each submit attempt

        // Validate file size and type
        const file = values.avatar;
        if (file) {
            if (file.size > MAX_FILE_SIZE) {
                setServerError(`File size should be less than ${MAX_FILE_SIZE / (1024 * 1024)}MB.`);
                return;
            }

            if (!ACCEPTED_FILE_TYPES.includes(file.type)) {
                setServerError(`Invalid file type. Accepted types are: ${ACCEPTED_FILE_TYPES.join(", ")}.`);
                return;
            }
        }

        try {
            // Prepare the application/json body
            const data = {
                username: values.username,
                email: values.email,
                firstName: values.firstName,
                lastName: values.lastName,
                phone: values.phone,
                avatar: values.avatar ? cleanBase64Data(await encodeImageToBase64(values.avatar) as string) : null,
            }

            console.log(data);

            // Make the request using the api instance
            const response = await api.put('/users/update_profile', JSON.stringify(data), {
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            if (response.status === 200) {
                let userr = localStorage.getItem('user');
                if (userr) {
                    const parsedUser = JSON.parse(userr);
                    if (parsedUser) {
                        if (data.avatar !== null) {
                            parsedUser.avatar = data.avatar;
                        } else {
                            parsedUser.avatar = user?.avatar;
                        }
                        parsedUser.email = data.email;
                        parsedUser.firstName = data.firstName;
                        parsedUser.lastName = data.lastName;
                        parsedUser.phone = data.phone;
                        parsedUser.username = data.username;
                        localStorage.setItem('user', JSON.stringify(parsedUser));
                        setUser(parsedUser);
                    }
                }
                router.push('/user/profile'); // Redirect on successful update
            }
        } catch (error: any) {
            if (error.response && error.response.data) {
                const errorData = error.response.data;
                if (errorData.error === "Username should be unique") {
                    form.setError("username", { type: "manual", message: "Username should be unique" });
                } else if (errorData.error === "Email should be unique") {
                    form.setError("email", { type: "manual", message: "Email should be unique" });
                } else {
                    setServerError(errorData.error || "An unknown error occurred.");
                }
            } else {
                setServerError("An error occurred. Please try again later.");
            }
        }
    };

    return (
        <div className="flex items-center justify-center bg-none transition duration-300 p-2">
            <FrostedGlass className={"w-full max-w-md sm:max-w-lg md:max-w-xl lg:max-w-2xl"}>
                <CardHeader>
                    <CardTitle>Update Profile</CardTitle>
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
                                            <Input placeholder="Email" type="email" {...field} className='bg-white/40 dark:bg-black/40 inputT'/>
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
                                            <Input placeholder="First Name" {...field} className='bg-white/40 dark:bg-black/40 inputT'/>
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
                                            <Input placeholder="Last Name" {...field} className='bg-white/40 dark:bg-black/40 inputT'/>
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
                                            <Input placeholder="Optional" {...field} className='bg-white/40 dark:bg-black/40 inputT'/>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="avatar"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Avatar</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="file"
                                                accept={ACCEPTED_FILE_TYPES.join(",")}
                                                onChange={(e) => field.onChange(e.target.files?.[0] || null)} className='bg-white/40 dark:bg-black/40 inputT'
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <div className="flex justify-between">
                                <Button type="submit">Update</Button>
                                <Button variant="destructive" onClick={() => router.push('/user/profile')}>Cancel</Button>
                            </div>
                        </form>
                    </Form>
                </CardContent>
            </FrostedGlass>
        </div>
    );
}

export default SignupForm;
