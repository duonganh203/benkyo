import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useState } from 'react';

type CreateScheduleModalProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onCreate: (title: string, description: string) => void;
};

const CreateScheduleModal = ({ open, onOpenChange, onCreate }: CreateScheduleModalProps) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');

    const handleCreate = () => {
        onCreate(title, description);
        setTitle('');
        setDescription('');
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className='sm:max-w-md'>
                <DialogHeader>
                    <DialogTitle>Create Schedule</DialogTitle>
                </DialogHeader>
                <div className='space-y-4'>
                    <Label>Schedule Title</Label>
                    <Input placeholder='Enter title' value={title} onChange={(e) => setTitle(e.target.value)} />
                    <Label>Description</Label>
                    <Textarea
                        placeholder='Enter description'
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                    />
                    <Button className='w-full' onClick={handleCreate}>
                        Create
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default CreateScheduleModal;
