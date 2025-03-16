'use client';
import type React from 'react';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Camera } from 'lucide-react';
import cloudinaryConfig from '@/config/cloudinary';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { profileFormSchema } from '@/schemas/userSchema';
import useAuthStore from '@/hooks/stores/use-auth-store';
import useUpdateUser from '@/hooks/queries/use-update-user';
import { getToast } from '@/utils/getToast';
import { updateUserPayload } from '@/types/user';

type ProfileFormValues = z.infer<typeof profileFormSchema>;
export default function EditProfilePage() {
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const { mutateAsync: updateUser, isPending } = useUpdateUser();

    const [avatar, setAvatar] = useState<string | undefined>(undefined);
    const { setUser, user } = useAuthStore();

    const form = useForm<ProfileFormValues>({
        resolver: zodResolver(profileFormSchema),
        defaultValues: {
            name: user?.name,
            email: user?.email
        }
    });
    useEffect(() => {
        if (user) {
            form.reset({
                name: user?.name,
                email: user?.email
            });
        }
    }, [user, form]);
    const onSubmit = (data: ProfileFormValues) => {
        const { email, ...rest } = data;
        let updateData: updateUserPayload = { ...rest };
        if (avatar !== undefined) {
            updateData = { ...rest, avatar };
        }

        updateUser(updateData, {
            onSuccess: (user) => {
                getToast('success', 'User updated successfully!!!');
                setUser(user);
            },
            onError: (error) => {
                getToast('error', error.message || 'Something went wrong!!!');
            }
        });
    };

    const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', cloudinaryConfig.uploadPreset);
        setIsLoading(true);
        axios
            .post(`${cloudinaryConfig.apiBase}${cloudinaryConfig.cloudName}/image/upload`, formData)
            .then((response) => {
                setAvatar(response.data.secure_url);
            })
            .catch((error) => {
                console.error('Upload failed:', error);
            })
            .finally(() => {
                setIsLoading(false);
            });
    };

    return (
        <div className='container max-w-2xl py-10'>
            <Card>
                <CardHeader>
                    <CardTitle className='text-2xl'>Edit Profile</CardTitle>
                    <CardDescription>
                        Update your profile information. This information will be displayed publicly.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className='mb-8 flex flex-col items-center space-y-4'>
                        <Avatar className='h-24 w-24'>
                            <AvatarImage src={avatar ?? user?.avatar} alt='Profile picture' />
                            <AvatarFallback>JD</AvatarFallback>
                        </Avatar>
                        <div className='relative'>
                            <Button
                                variant='outline'
                                size='sm'
                                className='relative'
                                onClick={() => document.getElementById('avatar-upload')?.click()}
                            >
                                <Camera className='mr-2 h-4 w-4' />
                                Change Avatar
                            </Button>
                            <Input
                                id='avatar-upload'
                                type='file'
                                accept='image/*'
                                className='hidden'
                                onChange={handleAvatarChange}
                            />
                        </div>
                    </div>

                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
                            <FormField
                                control={form.control}
                                name='name'
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Name</FormLabel>
                                        <FormControl>
                                            <Input placeholder='Your name' {...field} />
                                        </FormControl>
                                        <FormDescription>This is your public display name.</FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name='email'
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Email</FormLabel>
                                        <FormControl>
                                            <Input disabled placeholder='Your email' {...field} />
                                        </FormControl>
                                        <FormDescription>
                                            Your email address will not be displayed publicly.
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <CardFooter className='flex justify-end gap-2 px-0'>
                                <Button variant='outline' type='button'>
                                    Cancel
                                </Button>
                                <Button type='submit' disabled={isPending || isLoading}>
                                    Save Changes
                                </Button>
                            </CardFooter>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    );
}
