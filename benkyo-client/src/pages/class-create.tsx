import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import useAuthStore from '@/hooks/stores/use-auth-store';
import useClassCreate from '@/hooks/queries/use-class-create';

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';

import { getToast } from '@/utils/getToast';
import uploadToCloudinary from '@/utils/uploadToCloudinary';

import { classSchema } from '@/schemas/classSchema';
import { ClassUserRequestDto } from '@/types/class';

const ClassCreate = () => {
    const navigate = useNavigate();

    const { user } = useAuthStore((store) => store);
    if (!user) {
        navigate('/login');
        getToast('error', 'You must be logged in to continue.');
    } else if (!user.isPro) {
        navigate('/class/list');
        getToast('error', 'This feature is available for Pro users only.');
    }

    const form = useForm<z.infer<typeof classSchema>>({
        resolver: zodResolver(classSchema),
        defaultValues: {
            name: '',
            description: '',
            visibility: 'private',
            requiredApprovalToJoin: false,
            bannerUrl: ''
        }
    });

    const [previewBanner, setPreviewBanner] = useState<string>();
    const [isUploadingBanner, setIsUploadingBanner] = useState(false);
    const handleBannerChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setIsUploadingBanner(true);
        try {
            const imageUrl = await uploadToCloudinary(file);
            if (imageUrl) {
                setPreviewBanner(imageUrl);
                form.setValue('bannerUrl', imageUrl, { shouldValidate: true });
            }
        } catch {
            getToast('error', 'Failed to upload image');
        } finally {
            setIsUploadingBanner(false);
        }
    };

    const { mutateAsync: createClassMutation, isPending: isSubmitting } = useClassCreate();
    const onSubmit = async (values: ClassUserRequestDto) => {
        await createClassMutation(values);
    };

    return (
        <div className='flex justify-center items-start min-h-screen px-4 py-10 bg-background'>
            <div className='w-full max-w-2xl min-h-[600px] px-4 py-6'>
                <Card className='shadow-xl border border-border rounded-2xl'>
                    <CardHeader>
                        <CardTitle className='text-2xl text-center'>Create New Class</CardTitle>
                        <CardDescription className='text-center text-muted-foreground'>
                            Set up your class with custom settings and invite students
                        </CardDescription>
                    </CardHeader>

                    <CardContent>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
                                <FormField
                                    control={form.control}
                                    name='name'
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Class Name</FormLabel>
                                            <FormControl>
                                                <Input placeholder='Enter class name' {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name='description'
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Description</FormLabel>
                                            <FormControl>
                                                <Textarea placeholder='Describe your class...' rows={4} {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name='visibility'
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Visibility</FormLabel>
                                            <FormControl>
                                                <div className='space-y-2'>
                                                    <Select value={field.value} onValueChange={field.onChange}>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder='Select visibility' />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value='private'>Private</SelectItem>
                                                            <SelectItem value='public'>Public</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                    <div className='text-xs text-muted-foreground pl-1'>
                                                        <p>
                                                            <strong>Private</strong>: Only invited students can access
                                                            this class.
                                                        </p>
                                                        <p>
                                                            <strong>Public</strong>: Anyone with the class link can join
                                                            and view it.
                                                        </p>
                                                    </div>
                                                </div>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name='bannerUrl'
                                    render={() => (
                                        <FormItem>
                                            <FormLabel>
                                                Class Banner <span className='text-red-500'>*</span>
                                            </FormLabel>
                                            <div className='flex flex-col space-y-4'>
                                                {isUploadingBanner ? (
                                                    <div className='w-full h-[150px] flex items-center justify-center rounded-lg border border-border bg-muted text-sm text-muted-foreground'>
                                                        Uploading banner...
                                                    </div>
                                                ) : previewBanner ? (
                                                    <div className='w-full h-[150px] overflow-hidden rounded-lg border border-border shadow-sm'>
                                                        <img
                                                            src={previewBanner}
                                                            alt='Banner'
                                                            className='w-full h-full object-cover'
                                                        />
                                                    </div>
                                                ) : null}

                                                <div>
                                                    <Button
                                                        type='button'
                                                        variant='outline'
                                                        size='sm'
                                                        className='cursor-pointer'
                                                        onClick={() =>
                                                            document.getElementById('banner-upload')?.click()
                                                        }
                                                        disabled={isUploadingBanner}
                                                    >
                                                        {isUploadingBanner ? 'Uploading...' : 'Add Image Banner'}
                                                    </Button>
                                                    <Input
                                                        id='banner-upload'
                                                        type='file'
                                                        accept='image/*'
                                                        className='hidden'
                                                        onChange={handleBannerChange}
                                                    />
                                                </div>
                                            </div>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name='requiredApprovalToJoin'
                                    render={({ field }) => (
                                        <FormItem className='flex items-center justify-between p-4 border rounded-lg'>
                                            <div>
                                                <FormLabel>Require Approval to Join</FormLabel>
                                                <p className='text-sm text-muted-foreground'>
                                                    Students need approval before joining the class
                                                </p>
                                            </div>
                                            <FormControl>
                                                <Switch checked={field.value} onCheckedChange={field.onChange} />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />

                                <div className='flex gap-4 pt-6'>
                                    <Button
                                        type='button'
                                        variant='outline'
                                        className='flex-1'
                                        onClick={() => navigate('/class/list')}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        type='submit'
                                        className='flex-1 bg-green-600 hover:bg-green-700'
                                        disabled={isSubmitting}
                                    >
                                        {isSubmitting ? 'Creating...' : 'Create Class'}
                                    </Button>
                                </div>
                            </form>
                        </Form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default ClassCreate;
