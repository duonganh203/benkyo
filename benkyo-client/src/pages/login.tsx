import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import useLogin from '@/hooks/queries/useLogin';
import { LoginSchema } from '@/schemas';
import useAuthStore from '@/hooks/useAuthStore';
const Login = () => {
    const { mutate: login } = useLogin();
    const { setUser, setToken } = useAuthStore();
    const form = useForm<z.infer<typeof LoginSchema>>({
        resolver: zodResolver(LoginSchema),
        defaultValues: {
            email: '',
            password: ''
        }
    });

    const onSubmit = (data: z.infer<typeof LoginSchema>) => {
        login(data, {
            onSuccess: (data) => {
                setUser(data.user);
                setToken(data.token);
            },
            onError: (error) => {
                console.error(error);
            }
        });
    };
    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-8'>
                <FormField
                    control={form.control}
                    name='email'
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                                <Input placeholder='Email' {...field} />
                            </FormControl>
                            <FormDescription>This is your public display name.</FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name='password'
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Password</FormLabel>
                            <FormControl>
                                <Input placeholder='password' {...field} type='password' />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <Button type='submit'>Submit</Button>
            </form>
        </Form>
    );
};

export default Login;
