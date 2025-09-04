import type React from 'react';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Camera, Eye, EyeOff } from 'lucide-react';
import cloudinaryConfig from '@/config/cloudinaryAvatar';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import useAuthStore from '@/hooks/stores/use-auth-store';
import { getToast } from '@/utils/getToast';
import type { updateUserPayload } from '@/types/user';
import { updateProfileSchema } from '@/schemas/userSchema';
import useUpdateUser from '@/hooks/queries/use-update-profile';
import useChangePassword from '@/hooks/queries/use-change-password';
import type { ChangePasswordPayload } from '@/types/auth';

type ProfileFormValues = z.infer<typeof updateProfileSchema>;

const changePasswordSchema = z
    .object({
        currentPassword: z.string().min(1, 'Current password is required'),
        newPassword: z.string().min(6, 'Password must be at least 6 characters'),
        confirmPassword: z.string().min(1, 'Please confirm your password')
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
        message: "Passwords don't match",
        path: ['confirmPassword']
    });

type PasswordFormValues = z.infer<typeof changePasswordSchema>;

export default function Profile() {
    const [isLoading, setIsLoading] = useState(false);
    const { mutateAsync: updateUser, isPending } = useUpdateUser();
    const { mutateAsync: changePassword, isPending: isPasswordLoading } = useChangePassword();
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewAvatar, setPreviewAvatar] = useState<string | undefined>(undefined);
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const { setUser, user } = useAuthStore((store) => store);

    const form = useForm<ProfileFormValues>({
        resolver: zodResolver(updateProfileSchema),
        defaultValues: {
            name: user?.username || '',
            email: user?.email || ''
        }
    });

    const passwordForm = useForm<PasswordFormValues>({
        resolver: zodResolver(changePasswordSchema),
        defaultValues: {
            currentPassword: '',
            newPassword: '',
            confirmPassword: ''
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
                setUser({ ...user, ...updatedUser });
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

    const onPasswordSubmit = async (data: PasswordFormValues) => {
        const payload: ChangePasswordPayload = {
            oldPassword: data.currentPassword,
            newPassword: data.newPassword
        };

        changePassword(payload, {
            onSuccess: () => {
                getToast('success', 'Password changed successfully!');
                passwordForm.reset();
            },
            onError: (error: any) => {
                getToast('error', error.message || 'Failed to change password');
            }
        });
    };
    const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;
        setSelectedFile(file);
        setPreviewAvatar(URL.createObjectURL(file));
    };
    const isGoogleLogin = localStorage.getItem('isGoogleLogin') === 'true';
    return (
        <div className='max-w-3xl h-full flex flex-col justify-center mx-auto py-8 px-4 space-y-6'>
            {/* PROFILE CARD */}
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
                                <Button
                                    variant='outline'
                                    type='button'
                                    onClick={() => form.reset({ name: user?.username || '', email: user?.email || '' })}
                                >
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

            {/* CHANGE PASSWORD CARD */}
            <Card>
                <CardHeader>
                    <CardTitle className='text-2xl'>Change Password</CardTitle>
                    <CardDescription>Update your password to keep your account secure.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...passwordForm}>
                        <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className='space-y-6'>
                            <FormField
                                control={passwordForm.control}
                                name='currentPassword'
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Current Password</FormLabel>
                                        <FormControl>
                                            <div className='relative'>
                                                <Input
                                                    type={showCurrentPassword ? 'text' : 'password'}
                                                    placeholder='Enter your current password'
                                                    {...field}
                                                    disabled={isGoogleLogin}
                                                />
                                                <Button
                                                    type='button'
                                                    variant='ghost'
                                                    size='sm'
                                                    className='absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent'
                                                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                                    disabled={isGoogleLogin}
                                                >
                                                    {showCurrentPassword ? (
                                                        <EyeOff className='h-4 w-4' />
                                                    ) : (
                                                        <Eye className='h-4 w-4' />
                                                    )}
                                                </Button>
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={passwordForm.control}
                                name='newPassword'
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>New Password</FormLabel>
                                        <FormControl>
                                            <div className='relative'>
                                                <Input
                                                    type={showNewPassword ? 'text' : 'password'}
                                                    placeholder='Enter your new password'
                                                    {...field}
                                                    disabled={isGoogleLogin}
                                                />
                                                <Button
                                                    type='button'
                                                    variant='ghost'
                                                    size='sm'
                                                    className='absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent'
                                                    onClick={() => setShowNewPassword(!showNewPassword)}
                                                    disabled={isGoogleLogin}
                                                >
                                                    {showNewPassword ? (
                                                        <EyeOff className='h-4 w-4' />
                                                    ) : (
                                                        <Eye className='h-4 w-4' />
                                                    )}
                                                </Button>
                                            </div>
                                        </FormControl>
                                        <FormDescription>Password must be at least 6 characters long.</FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={passwordForm.control}
                                name='confirmPassword'
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Confirm New Password</FormLabel>
                                        <FormControl>
                                            <div className='relative'>
                                                <Input
                                                    type={showConfirmPassword ? 'text' : 'password'}
                                                    placeholder='Confirm your new password'
                                                    {...field}
                                                    disabled={isGoogleLogin}
                                                />
                                                <Button
                                                    type='button'
                                                    variant='ghost'
                                                    size='sm'
                                                    className='absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent'
                                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                    disabled={isGoogleLogin}
                                                >
                                                    {showConfirmPassword ? (
                                                        <EyeOff className='h-4 w-4' />
                                                    ) : (
                                                        <Eye className='h-4 w-4' />
                                                    )}
                                                </Button>
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <CardFooter className='flex justify-end gap-2 px-0'>
                                <Button
                                    variant='outline'
                                    type='button'
                                    onClick={() => passwordForm.reset()}
                                    disabled={isGoogleLogin}
                                >
                                    Cancel
                                </Button>
                                <Button type='submit' disabled={isPasswordLoading || isGoogleLogin}>
                                    {isPasswordLoading ? 'Changing...' : 'Change Password'}
                                </Button>
                            </CardFooter>
                            {isGoogleLogin && (
                                <p className='text-sm text-muted-foreground mt-2'>
                                    Google accounts cannot change password here.
                                </p>
                            )}
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    );
}
