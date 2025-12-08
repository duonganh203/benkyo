import type React from 'react';
import { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import {
    Camera,
    Eye,
    EyeOff,
    Search,
    ChevronLeft,
    ChevronRight,
    User as UserIcon,
    Heart,
    BookOpen
} from 'lucide-react';
import cloudinaryConfig from '@/config/cloudinaryAvatar';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import useAuthStore from '@/hooks/stores/use-auth-store';
import { getToast } from '@/utils/getToast';
import type { updateUserPayload } from '@/types/user';
import { updateProfileSchema } from '@/schemas/userSchema';
import useUpdateUser from '@/hooks/queries/use-update-profile';
import useChangePassword from '@/hooks/queries/use-change-password';
import type { ChangePasswordPayload } from '@/types/auth';
import { useLikedDecksHistory } from '@/hooks/queries/use-get-liked-decks';

type LikedDeckItem = {
    id: string;
    name: string;
    description: string | null;
    cardCount: number;
    creatorName: string;
    likeCount: number;
    createdAt: string;
    updatedAt: string;
};

type ProfileFormValues = z.infer<typeof updateProfileSchema>;
import { useNavigate } from 'react-router-dom';
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

const ITEMS_PER_PAGE = 5;
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

    const { data: likedDecks, isLoading: isLikedLoading } = useLikedDecksHistory();
    console.log('likedDecks >>>', likedDecks);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);

    const filteredDecks = useMemo(() => {
        if (!likedDecks || typeof likedDecks !== 'object' || likedDecks === null) {
            return [];
        }

        let decks: LikedDeckItem[] = [];
        if (Array.isArray(likedDecks)) {
            decks = likedDecks as LikedDeckItem[];
        } else {
            const values = Object.values(likedDecks);
            decks = values.filter(
                (item: any) => item && typeof item.id === 'string' && typeof item.name === 'string'
            ) as LikedDeckItem[];
        }
        return decks.filter((deck) => {
            if (!deck || !deck.name) {
                return false;
            }
            return deck.name.toLowerCase().includes(search.toLowerCase());
        });
    }, [likedDecks, search]);

    const totalPages = Math.ceil(filteredDecks.length / ITEMS_PER_PAGE);

    const paginatedDecks = filteredDecks.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);
    const navigate = useNavigate();
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
            newPassword: data.newPassword,
            confirmPassword: data.confirmPassword
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

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Hàm này không được sử dụng, tôi sẽ bỏ qua nó
    // const getStatusColor = (status: string) => {
    //     switch (status) {
    //         case 'completed':
    //             return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
    //         case 'in-progress':
    //             return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
    //         default:
    //             return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    //     }
    // };

    const isGoogleLogin = localStorage.getItem('isGoogleLogin') === 'true';

    return (
        <div className='max-w-4xl h-full flex flex-col justify-center mx-auto py-8 px-4'>
            <Tabs defaultValue='profile' className='w-full'>
                <TabsList className='grid w-full grid-cols-3'>
                    <TabsTrigger value='profile'>Profile</TabsTrigger>
                    <TabsTrigger value='password'>Change Password</TabsTrigger>
                    <TabsTrigger value='history'>Deck History</TabsTrigger>
                </TabsList>

                {/* PROFILE TAB */}
                <TabsContent value='profile' className='space-y-6'>
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
                                        className='relative bg-transparent'
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
                                            onClick={() =>
                                                form.reset({ name: user?.username || '', email: user?.email || '' })
                                            }
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
                </TabsContent>

                {/* CHANGE PASSWORD TAB */}
                <TabsContent value='password' className='space-y-6'>
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
                                                <FormDescription>
                                                    Password must be at least 6 characters long.
                                                </FormDescription>
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
                </TabsContent>

                {/* DECK HISTORY TAB */}
                <TabsContent value='history' className='space-y-6 pt-6'>
                    {/* Search Bar - Đã làm tròn và thêm icon Search */}
                    <div className='relative w-full max-w-md'>
                        <Search className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400' />
                        <Input
                            placeholder='Search decks by name...'
                            value={search}
                            onChange={(e) => {
                                setSearch(e.target.value);
                                setPage(1);
                            }}
                            className='w-full rounded-full shadow-sm pl-10 h-10'
                        />
                    </div>

                    {isLikedLoading ? (
                        <div className='col-span-full p-10 text-center text-blue-500 font-semibold'>
                            Loading liked decks...
                        </div>
                    ) : (
                        <div className='grid gap-4 grid-cols-1'>
                            {paginatedDecks.length > 0 ? (
                                (paginatedDecks as LikedDeckItem[]).map((deck) => (
                                    <Card
                                        key={deck.id}
                                        className='group flex flex-col sm:flex-row gap-4 p-5 rounded-xl shadow-md border border-gray-200 transition-all duration-300 hover:shadow-xl hover:border-blue-500 cursor-pointer dark:border-gray-700'
                                        onClick={() => navigate(`/deck/${deck.id}`)}
                                    >
                                        <div
                                            className='flex-shrink-0 flex items-center justify-center w-12 h-12 rounded-full 
                                                         bg-background/30 backdrop-blur-sm text-blue-600 font-extrabold text-lg 
                                                         border-2 border-blue-500/30 self-start sm:self-center'
                                        >
                                            <BookOpen className='h-6 w-6' />
                                        </div>

                                        <div className='flex-1 space-y-2 min-w-0'>
                                            {/* Header */}
                                            <div className='flex items-start justify-between gap-3'>
                                                <h3 className='text-lg font-bold line-clamp-1 text-gray-800 dark:text-white group-hover:text-blue-600 transition-colors'>
                                                    {deck.name}
                                                </h3>
                                                <span
                                                    className='flex-shrink-0 text-xs font-medium px-2 py-1 rounded-full 
                                                                 bg-background/30 backdrop-blur-sm text-green-700 border border-green-200 dark:text-green-300'
                                                >
                                                    {deck.cardCount} Cards
                                                </span>
                                            </div>

                                            {/* Mô tả */}
                                            <p className='line-clamp-2 text-sm text-gray-500 dark:text-gray-400'>
                                                {deck.description || 'No description provided.'}
                                            </p>

                                            {/* Footer - Thông tin thêm (Creator & Likes) */}
                                            <div className='flex flex-wrap items-center gap-x-6 gap-y-2 text-sm pt-2 border-t border-gray-100 dark:border-gray-700 mt-3'>
                                                <p className='flex items-center gap-1 text-gray-600 dark:text-gray-300'>
                                                    <UserIcon className='h-4 w-4 text-blue-500' />
                                                    <span className='font-medium'>{deck.creatorName}</span>
                                                </p>
                                                <p className='flex items-center gap-1 text-gray-600 dark:text-gray-300'>
                                                    <Heart className='h-4 w-4 text-red-500 fill-red-500' />
                                                    <span className='font-medium'>{deck.likeCount} Likes</span>
                                                </p>
                                            </div>

                                            {/* Time info - Sử dụng formatDate mới */}
                                            <div className='text-xs text-gray-400 mt-2 flex flex-wrap gap-x-4 gap-y-1'>
                                                <p>📅 Created: {formatDate(deck.createdAt)}</p>
                                                <p>✏️ Updated: {formatDate(deck.updatedAt)}</p>
                                            </div>
                                        </div>
                                    </Card>
                                ))
                            ) : (
                                <div className='col-span-full p-10 border-2 border-dashed rounded-xl bg-background/40 backdrop-blur-sm dark:bg-background/40 dark:border-gray-600'>
                                    <p className='text-center text-lg text-gray-500 dark:text-gray-300 font-medium'>
                                        {search
                                            ? `No test sets were found matching the keyword"${search}".`
                                            : 'You do not like any set of questions yet. Search and like a set of questions!'}
                                    </p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Pagination - Đã làm tròn và dùng icon Chevron */}
                    {totalPages > 1 && (
                        <div className='flex justify-center items-center gap-4 pt-4'>
                            <Button
                                variant='outline'
                                size='icon'
                                disabled={page === 1}
                                onClick={() => setPage((p) => p - 1)}
                                className='rounded-full h-9 w-9 p-0'
                            >
                                <ChevronLeft className='h-4 w-4' />
                            </Button>

                            <span className='text-sm font-medium text-gray-700 dark:text-gray-300'>
                                Page {page} of {totalPages}
                            </span>

                            <Button
                                variant='outline'
                                size='icon'
                                disabled={page === totalPages}
                                onClick={() => setPage((p) => p + 1)}
                                className='rounded-full h-9 w-9 p-0'
                            >
                                <ChevronRight className='h-4 w-4' />
                            </Button>
                        </div>
                    )}
                </TabsContent>
            </Tabs>
        </div>
    );
}
