import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { User, UserPlus } from 'lucide-react'; // Use User and UserPlus icons
import { apiClient } from '@/lib/api'; // Don't need setAuthToken here
import { useToast } from '@/components/ui/use-toast';

// Schema matching dj-rest-auth registration defaults
const formSchema = z.object({
    username: z.string().min(3, { message: "Username must be at least 3 characters." }),
    email: z.string().email({ message: "Please enter a valid email address." }),
    password: z.string().min(8, { message: "Password must be at least 8 characters." }),
    password2: z.string(),
}).refine(data => data.password === data.password2, {
    message: "Passwords don't match",
    path: ["password2"], // path of error
});

// Update response type (our view returns user data, not key)
interface RegisterResponse {
    username: string;
    email: string;
    first_name?: string;
    last_name?: string;
}

const RegisterPage = () => {
    const navigate = useNavigate();
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: { username: "", email: "", password: "", password2: "" },
    });

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        setIsLoading(true);
        form.clearErrors(); // Clear previous errors

        try {
            // Send the complete 'values' object
            const data = await apiClient<RegisterResponse>('/register/', {
                method: 'POST',
                body: JSON.stringify(values), // Use 'values' directly
            });

            toast({ title: "Registration Successful", description: `User ${data.username} created. Please log in.` });
            navigate('/login');

        } catch (err: any) {
            console.error("Registration error:", err);
            try {
                // Attempt to parse specific field errors (e.g., {"email": ["Email already exists."]})
                const errorData = JSON.parse(err.message.substring(err.message.indexOf('{')));
                Object.keys(errorData).forEach((fieldName) => {
                    // Map potential non-field errors (like non_field_errors) to root
                    const fieldKey = ['username', 'email', 'password', 'password2'].includes(fieldName)
                        ? fieldName as keyof z.infer<typeof formSchema>
                        : 'root';
                    form.setError(fieldKey, {
                        type: 'server',
                        // Join messages if backend sends a list
                        message: Array.isArray(errorData[fieldName]) ? errorData[fieldName].join(", ") : String(errorData[fieldName])
                    });
                });
            } catch (parseError) {
                // If parsing fails, show the generic error message
                form.setError("root", { message: err.message || 'Registration failed.' });
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center p-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-heading font-bold text-canteen-primary">Create Account</h1>
                    <p className="text-gray-500 mt-2">Sign up to start ordering</p>
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
                            {/* Username Field */}
                            <FormField
                                control={form.control}
                                name="username"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Username</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Choose a username" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Email Field */}
                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Email</FormLabel>
                                        <FormControl>
                                            <Input type="email" placeholder="your.email@example.com" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Password Field */}
                            <FormField
                                control={form.control}
                                name="password"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Password</FormLabel>
                                        <FormControl>
                                            <Input type="password" placeholder="Choose a password" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Confirm Password Field */}
                            <FormField
                                control={form.control}
                                name="password2"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Confirm Password</FormLabel>
                                        <FormControl>
                                            <Input type="password" placeholder="Confirm your password" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <Button type="submit" className="w-full gap-2" disabled={isLoading}>
                                {isLoading ? 'Creating Account...' : 'Register'}
                            </Button>
                        </form>
                    </Form>

                    <div className="text-center mt-6 text-sm">
                        <p className="text-gray-500">Already have an account?
                            <Link to="/login" className="font-medium text-canteen-primary hover:underline ml-1">Log in</Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage; 