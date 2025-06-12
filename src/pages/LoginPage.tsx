import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { User, LogIn } from 'lucide-react';
import { apiClient } from '@/lib/api';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';

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
    const auth = useAuth();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showAdminDialog, setShowAdminDialog] = useState(false);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: { username: "", password: "" },
    });

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        setIsSubmitting(true);
        form.clearErrors();
        try {
            const data = await apiClient<LoginResponse>('/dj-rest-auth/login/', {
                method: 'POST',
                body: JSON.stringify(values),
            });

            if (data.key) {
                await auth.login(data.key);
                toast({ title: "Login Successful", description: "Welcome back!" });
                
                // Check if the user is admin/staff after auth.login completes
                if (auth.user && (auth.user.is_staff || auth.user.is_superuser)) {
                    setShowAdminDialog(true);
                } else {
                    navigate('/');
                }
            } else {
                form.setError("root", { message: "Login failed: No token received." });
            }
        } catch (err: any) {
            console.error("Login error:", err);
            const errorMessage = err.response?.data?.detail || err.message || 'Login failed. Please check credentials.';
            form.setError("root", { message: errorMessage });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleContinueAsUser = () => {
        setShowAdminDialog(false);
        navigate('/');
    };

    const handleGoToAdmin = () => {
        setShowAdminDialog(false);
        navigate('/admin');
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col justify-center items-center p-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-primary brand-gradient">
                        Welcome Back
                    </h1>
                    <p className="text-muted-foreground mt-2">Login to continue to Canteen Flow.</p>
                </div>

                <div className="bg-card rounded-xl shadow-lg p-8 border dark:border-gray-700">
                    <div className="flex justify-center mb-6">
                        <div className="bg-primary/10 p-4 rounded-full border border-primary/20">
                            <User size={32} className="text-primary" />
                        </div>
                    </div>

                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            {form.formState.errors.root && (
                                <div className="bg-destructive/10 text-destructive p-3 rounded-md text-sm border border-destructive/30">
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
                                            <Input 
                                                placeholder="Enter your username" 
                                                {...field} 
                                                className="h-10"
                                                disabled={isSubmitting || auth.isLoading} 
                                            />
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
                                            <Input 
                                                type="password" 
                                                placeholder="Enter your password" 
                                                {...field} 
                                                className="h-10"
                                                disabled={isSubmitting || auth.isLoading}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <Button 
                                type="submit" 
                                className="w-full gap-2 h-11 text-base bg-primary hover:bg-primary/90" 
                                disabled={isSubmitting || auth.isLoading}
                            >
                                {isSubmitting || auth.isLoading ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Logging in...
                                    </>
                                ) : (
                                    <>
                                        <LogIn size={18} className="mr-2" />
                                        Login
                                    </>
                                )}
                            </Button>
                        </form>
                    </Form>

                    <div className="text-center mt-8 text-sm">
                        <p className="text-muted-foreground">
                            Don't have an account?
                            <Link to="/register" className="font-medium text-primary hover:underline ml-1">
                                Sign up
                            </Link>
                        </p>
                    </div>
                </div>
                 <p className="text-xs text-muted-foreground text-center mt-8">
                    &copy; {new Date().getFullYear()} Canteen Flow. All rights reserved.
                </p>
            </div>

            {/* Admin options dialog */}
            <Dialog open={showAdminDialog} onOpenChange={setShowAdminDialog}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Admin Access</DialogTitle>
                        <DialogDescription>
                            You have admin privileges. Where would you like to go?
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="flex flex-col sm:flex-row sm:justify-center gap-2 mt-4">
                        <Button variant="outline" onClick={handleContinueAsUser}>
                            Continue as Regular User
                        </Button>
                        <Button onClick={handleGoToAdmin}>
                            Go to Admin Dashboard
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default LoginPage; 