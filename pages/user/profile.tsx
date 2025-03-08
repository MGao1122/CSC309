import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { cn } from '@/lib/utils';
import FrostedGlass from '@/components/FrostedGlass';

type FormInputs = {
    username: string;
    email: string;
    firstName: string;
    lastName: string;
    phone: string;
};

const formSchema = z.object({
    username: z.string(),
    email: z.string(),
    firstName: z.string(),
    lastName: z.string(),
    phone: z.string(),
});

export function Profile() {
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
        },
    });

    const router = useRouter();

    // Run this effect only once to check if the component is mounted in the browser
    useEffect(() => {
        setIsBrowser(true);
    }, []);

    // Redirect to home if no user is found in localStorage (only run in the browser)
    useEffect(() => {
        if (isBrowser && !localStorage.getItem('user')) {
            router.push("/login");
        }
    }, [isBrowser, router]);

    // Set the form default values from localStorage after component mounts
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

    return (
        <div className="flex items-center justify-center bg-none transition duration-300 p-2">
            <FrostedGlass className={cn("w-full max-w-md sm:max-w-lg md:max-w-xl lg:max-w-2xl")}>
                <CardHeader>
                    <CardTitle>Profile</CardTitle>
                    <CardDescription>{serverError && (
                        <div className="text-red-600 font-bold">{serverError}</div>
                    )}</CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form className="space-y-8">
                            <FormField
                                control={form.control}
                                name="username"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Username</FormLabel>
                                        <FormControl>
                                            <Input disabled placeholder="Username" {...field} />
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
                                            <Input disabled placeholder="Email" type="email" {...field} />
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
                                            <Input disabled placeholder="First Name" {...field} />
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
                                            <Input disabled placeholder="Last Name" {...field} />
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
                                            <Input disabled placeholder="Phone" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </form>
                    </Form>
                </CardContent>
                <CardFooter className="flex justify-between">
                        <Button onClick={() => router.push("/user/update_profile")}>Update profile</Button>
                        <Button variant="secondary" onClick={() => router.push('/')}>Home</Button>
                </CardFooter>
            </FrostedGlass>
        </div>
    );
}

export default Profile;
