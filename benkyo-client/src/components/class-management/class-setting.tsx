import { Settings, Upload, Save, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import uploadToCloudinary from '@/utils/uploadToCloudinary';
import useUpdateClass from '@/hooks/queries/use-update-class';
import useClassDelete from '@/hooks/queries/use-class-delete';
import useClassManagementStore from '@/hooks/stores/use-class-management-store';
import { getToast } from '@/utils/getToast';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { classSchema } from '@/schemas/classSchema';
import { ClassUserRequestDto } from '@/types/class';
import ConfirmDeleteClassModal from '@/components/modals/confirm-delete-class-modal';
import { useState } from 'react';

type ClassUpdateForm = Omit<ClassUserRequestDto, 'bannerUrl'> & {
    bannerUrl?: string;
};

export const ClassSetting = () => {
    const { classData } = useClassManagementStore();
    const navigate = useNavigate();
    const { mutateAsync: updateClass, isPending: isUpdating } = useUpdateClass();
    const { mutateAsync: deleteClass, isPending: isDeleting } = useClassDelete();
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    const form = useForm<ClassUpdateForm>({
        resolver: zodResolver(classSchema),
        defaultValues: {
            name: classData?.name || '',
            description: classData?.description || '',
            visibility: (classData?.visibility?.toLowerCase() as 'public' | 'private') || 'private',
            requiredApprovalToJoin: classData?.requiredApprovalToJoin || false,
            bannerUrl: classData?.bannerUrl || ''
        }
    });

    if (!classData) {
        return (
            <div className='flex justify-center items-start px-4 py-6'>
                <div className='w-full max-w-3xl'>
                    <Card>
                        <CardHeader>
                            <CardTitle className='flex items-center gap-2'>
                                <Settings className='w-5 h-5' />
                                Class Settings
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className='text-center py-8 text-muted-foreground'>No class data available</div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    }

    const handleBannerChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            try {
                const bannerUrl = await uploadToCloudinary(file);
                form.setValue('bannerUrl', bannerUrl);
                getToast('success', 'Banner uploaded successfully');
            } catch {
                getToast('error', 'Failed to upload image');
            }
        }
    };

    const onSubmit = async (values: ClassUpdateForm) => {
        await updateClass({ classId: classData._id, requestClass: values });
    };

    const handleDelete = () => {
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        await deleteClass(classData._id);
        setShowDeleteModal(false);
    };

    return (
        <>
            <div className='flex justify-center items-start px-4 py-6'>
                <div className='w-full max-w-3xl'>
                    <Card>
                        <CardHeader>
                            <CardTitle className='flex items-center gap-2'>
                                <Settings className='w-5 h-5' />
                                Class Settings
                            </CardTitle>
                            <CardDescription>Update your class information and preferences</CardDescription>
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
                                                    <Textarea
                                                        placeholder='Describe your class...'
                                                        rows={3}
                                                        {...field}
                                                    />
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
                                                    <Select value={field.value} onValueChange={field.onChange}>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder='Select visibility' />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value='private'>Private</SelectItem>
                                                            <SelectItem value='public'>Public</SelectItem>
                                                        </SelectContent>
                                                    </Select>
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
                                                <FormLabel>Class Banner</FormLabel>
                                                <div className='space-y-4'>
                                                    <div className='w-full h-32 overflow-hidden rounded-lg border border-border'>
                                                        <img
                                                            src={
                                                                form.watch('bannerUrl') ||
                                                                classData.bannerUrl ||
                                                                '/default-class-banner.jpg'
                                                            }
                                                            alt='Class Banner'
                                                            className='w-full h-full object-cover'
                                                        />
                                                    </div>
                                                    <div>
                                                        <Button
                                                            type='button'
                                                            variant='outline'
                                                            size='sm'
                                                            onClick={() =>
                                                                document.getElementById('banner-upload')?.click()
                                                            }
                                                        >
                                                            <Upload className='w-4 h-4 mr-2' />
                                                            Upload Banner
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
                                        <Button type='submit' className='flex-1' disabled={isUpdating}>
                                            <Save className='w-4 h-4 mr-2' />
                                            {isUpdating ? 'Updating...' : 'Save Changes'}
                                        </Button>
                                    </div>

                                    <div className='pt-4 border-t'>
                                        <Button
                                            type='button'
                                            variant='outline'
                                            className='w-full text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700'
                                            onClick={handleDelete}
                                            disabled={isDeleting}
                                        >
                                            <Trash2 className='w-4 h-4 mr-2' />
                                            {isDeleting ? 'Deleting...' : 'Delete Class'}
                                        </Button>
                                    </div>
                                </form>
                            </Form>
                        </CardContent>
                    </Card>
                </div>
            </div>

            <ConfirmDeleteClassModal
                open={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                onConfirm={confirmDelete}
                className={classData?.name || ''}
            />
        </>
    );
};
