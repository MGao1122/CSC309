// pages/login.tsx

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';
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
import StaticBlobs from '@/components/Background';
import FrostedGlass from '@/components/FrostedGlass';

type FormInputs = {
    userinfo: string;
    password: string;
}

const formSchema = z.object({
    userinfo: z.string().min(1, {
        message: 'Invalid username or email'
    }),
    password: z.string().min(6, {
        message: 'Invalid password'
    }),
})

export function LoginForm() {
    const [serverError, setServerError] = useState("");
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            userinfo: "",
            password: "",
        },
    })

    const router = useRouter();
    const { setUser } = useAuth();

    const onSubmit = async (values: FormInputs) => {
        try {
            const response = await fetch('http://localhost:3000/api/users/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(values),
            });

            if (response.ok) {
                const data = await response.json();
                localStorage.setItem('accessToken', data.accessToken);
                localStorage.setItem('refreshToken', data.refreshToken);
                localStorage.setItem('user', JSON.stringify(data.user));
                setUser(data.user);
                router.push('/');
            } else {
                const errorData = await response.json();
                console.log(errorData);
                if (errorData.error === "Incorrect password") {
                    form.setError("password", { type: "manual", message: "Incorrect password" });
                } else if (errorData.error === "Invalid email or password" || errorData.error === "Invalid username or password") {
                    form.setError("userinfo", { type: "manual", message: "User doesn't exist" });
                }
            }
        } catch (error) {
            setServerError('An error occurred during login');
        }
    }

    return (
        <div className="flex items-center justify-center bg-none transition duration-300 px-2 py-2">
            <FrostedGlass className={cn("w-full max-w-md sm:max-w-lg md:max-w-xl lg:max-w-2xl")}>
                <CardHeader>
                    <CardTitle>Login</CardTitle>
                    <CardDescription>{serverError && (
                        <div className="text-red-600 font-bold">{serverError}</div>
                    )}</CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">

                            <FormField
                                control={form.control}
                                name="userinfo"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>User</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Username or Email" {...field} className='bg-white/40 dark:bg-black/40 inputT' />
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
                            <div className='flex justify-between'>
                                <Button type="submit">Login</Button>
                                <Button type='button' variant='link' onClick={() => router.push('/signup')}>Sign up</Button>
                            </div>
                        </form>
                    </Form>
                </CardContent>
            </FrostedGlass>
        </div>
    );
}

export default LoginForm;
