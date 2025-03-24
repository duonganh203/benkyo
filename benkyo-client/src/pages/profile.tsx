'use client';
import type React from 'react';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Camera } from 'lucide-react';
import cloudinaryConfig from '@/config/cloudinaryAvatar';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import useAuthStore from '@/hooks/stores/use-auth-store';
import { getToast } from '@/utils/getToast';
import { updateUserPayload } from '@/types/user';
import { updateProfileSchema } from '@/schemas/userSchema';
import useUpdateUser from '@/hooks/queries/use-update-profile';

type ProfileFormValues = z.infer<typeof updateProfileSchema>;

export default function Profile() {
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const { mutateAsync: updateUser, isPending } = useUpdateUser();
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewAvatar, setPreviewAvatar] = useState<string | undefined>(undefined);
    const { setUser, user } = useAuthStore((store) => store);

    const form = useForm<ProfileFormValues>({
        resolver: zodResolver(updateProfileSchema),
        defaultValues: {
            name: user?.username || '',
            email: user?.email || ''
        }
    });

    useEffect(() => {
        if (user) {
            form.reset({
                name: user.username || '',
                email: user.email || ''
            });
        }
    }, [user, form]);

    const uploadImageToCloudinary = async (file: File) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', cloudinaryConfig.uploadPreset);

        try {
            const response = await axios.post(
                `${cloudinaryConfig.apiBase}${cloudinaryConfig.cloudName}/image/upload`,
                formData
            );
            return response.data.secure_url;
        } catch (error) {
            console.error('Upload failed:', error);
            getToast('error', 'Failed to upload image');
            return null;
        }
    };

    const onSubmit = async (data: ProfileFormValues) => {
        setIsLoading(true);
        let avatarUrl = user?.avatar;

        if (selectedFile) {
            const uploadedUrl = await uploadImageToCloudinary(selectedFile);
            if (uploadedUrl) avatarUrl = uploadedUrl;
        }

        const { email, ...rest } = data;
        const updateData: updateUserPayload = { ...rest, avatar: avatarUrl };

        updateUser(updateData, {
            onSuccess: (updatedUser) => {
                getToast('success', 'User updated successfully!!!');
                setUser(updatedUser);
                setPreviewAvatar(undefined);
                setSelectedFile(null);
            },
            onError: (error) => {
                getToast('error', error.message || 'Something went wrong!!!');
            },
            onSettled: () => {
                setIsLoading(false);
            }
        });
    };

    const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;
        setSelectedFile(file);
        setPreviewAvatar(URL.createObjectURL(file));
        console.log(previewAvatar);
    };

    return (
        <div className='max-w-3xl h-full flex flex-col justify-center mx-auto py-8 px-4'>
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
                            <AvatarImage src={previewAvatar || user?.avatar} alt='Profile picture' />
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
                                <Button variant='outline' type='button' onClick={() => form.reset()}>
                                    Cancel
                                </Button>
                                <Button type='submit' disabled={isPending || isLoading}>
                                    {isLoading || isPending ? 'Saving...' : 'Save Changes'}
                                </Button>
                            </CardFooter>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    );
}
