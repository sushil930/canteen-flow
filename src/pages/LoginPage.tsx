import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { User, LogIn } from 'lucide-react';
import { apiClient, setAuthToken } from '@/lib/api';
import { useToast } from '@/components/ui/use-toast';

const formSchema = z.object({
    username: z.string().min(1, { message: "Username is required." }),
    password: z.string().min(1, { message: "Password is required." }),
});

interface LoginResponse {
    key: string;
}

const LoginPage = () => {
    const navigate = useNavigate();
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: { username: "", password: "" },
    });

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        setIsLoading(true);
        try {
            const data = await apiClient<LoginResponse>('/auth/login/', {
                method: 'POST',
                body: JSON.stringify(values),
            });

            if (data.key) {
                setAuthToken(data.key);
                toast({ title: "Login Successful", description: "Welcome back!" });
                navigate('/menu');
            } else {
                form.setError("root", { message: "Login failed: No token received." });
            }
        } catch (err: any) {
            console.error("Login error:", err);
            form.setError("root", { message: err.message || 'Login failed. Please check credentials.' });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center p-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-heading font-bold text-canteen-primary">Customer Login</h1>
                    <p className="text-gray-500 mt-2">Access your account or continue as guest</p>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-8">
                    <div className="flex justify-center mb-6">
                        <div className="bg-canteen-primary/10 p-4 rounded-full">
                            <User size={28} className="text-canteen-primary" />
                        </div>
                    </div>

                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            {form.formState.errors.root && (
                                <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">
                                    {form.formState.errors.root.message}
                                </div>
                            )}
                            <FormField
                                control={form.control}
                                name="username"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Username</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Enter your username" {...field} />
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
                                            <Input type="password" placeholder="Enter your password" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <Button type="submit" className="w-full gap-2" disabled={isLoading}>
                                {isLoading ? 'Logging in...' : 'Login'}
                            </Button>
                        </form>
                    </Form>

                    <div className="text-center mt-6 text-sm">
                        <p className="text-gray-500">Don't have an account?
                            <Link to="/register" className="font-medium text-canteen-primary hover:underline ml-1">Sign up</Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage; 