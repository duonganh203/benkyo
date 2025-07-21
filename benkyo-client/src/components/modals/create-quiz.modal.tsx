import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectTrigger, SelectValue } from '@radix-ui/react-select';

type Props = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
};

const CreateQuizModal = ({ open, onOpenChange }: Props) => (
    <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className='sm:max-w-md'>
            <DialogHeader>
                <DialogTitle>Create Quiz</DialogTitle>
            </DialogHeader>
            <div className='space-y-4'>
                <Label>Quiz Name</Label>
                <Input placeholder='Enter quiz name' />
                <Label>Select Deck</Label>
                <Select>
                    <SelectTrigger>
                        <SelectValue placeholder='Choose deck' />
                    </SelectTrigger>
                    <SelectContent>{/* Add SelectItem here if needed */}</SelectContent>
                </Select>
                <Button className='w-full'>Create</Button>
            </div>
        </DialogContent>
    </Dialog>
);

export default CreateQuizModal;
