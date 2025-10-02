import { useRef, useState } from 'react';
import { Upload, FileText, ChevronRight, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { getToast } from '@/utils/getToast';
import { Document } from '@/types/document';
import useGetCreditAI from '@/hooks/queries/use-get-credit-ai';

interface DocumentSidebarProps {
    documents: Document[];
    isLoading: boolean;
    onDocumentSelect: (document: Document) => void;
    onFileUpload: (file: File, documentName: string) => Promise<Document>;
    onToggle: () => void;
    isUploading: boolean;
    selectedDocument?: Document | null;
}

const DocumentSidebar = ({
    documents,
    isLoading,
    onDocumentSelect,
    onFileUpload,
    onToggle,
    isUploading,
    selectedDocument
}: DocumentSidebarProps) => {
    const [dragActive, setDragActive] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [documentName, setDocumentName] = useState('');
    const { data: credit, refetch: getCreditAI } = useGetCreditAI('AI');
    const fileInputRef = useRef<HTMLInputElement>(null);
    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    };
    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        const file = e.dataTransfer.files?.[0];
        if (file) {
            checkAllowedAIAvailable(() => handleFile(file));
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        e.preventDefault();
        if (e.target.files && e.target.files[0]) {
            handleFile(e.target.files[0]);
        }
    };

    const handleFile = (file: File) => {
        if (!isValidFileType(file)) {
            getToast('error', 'Please upload a PDF, Word document, or text file');
            return;
        }
        if (file.size > 15 * 1024 * 1024) {
            getToast('error', 'File is too large. Maximum size is 15MB');
            return;
        }
        setSelectedFile(file);
        const fileName = file.name.split('.').slice(0, -1).join('.');
        setDocumentName(fileName);
    };

    const handleUpload = async () => {
        if (!selectedFile) {
            getToast('error', 'Please select a file to upload');
            return;
        }

        if (!documentName.trim()) {
            getToast('error', 'Please enter a document name');
            return;
        }

        await onFileUpload(selectedFile, documentName);
        clearFileSelection();
    };

    const clearFileSelection = () => {
        setSelectedFile(null);
        setDocumentName('');
    };

    const isValidFileType = (file: File) => {
        const allowedTypes = [
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'text/plain'
        ];
        return allowedTypes.includes(file.type);
    };
    const checkAllowedAIAvailable = async (onAllowed: () => void) => {
        await getCreditAI();
        if (credit?.remainingCredits.remaining <= 0) {
            getToast(
                'error',
                'You currently have no AI credits. Please purchase a plan to use this feature, or wait until your credits reset the next day.'
            );
            return;
        }
        onAllowed();
    };

    return (
        <div className='w-full h-full flex flex-col'>
            <div className='p-5 border-b flex items-center justify-between'>
                <h2 className='font-semibold'>Documents</h2>
                <Button variant='ghost' size='sm' onClick={onToggle} className='md:hidden'>
                    <ChevronRight className='h-4 w-4' />
                </Button>
            </div>

            <ScrollArea className='flex-1 overflow-y-auto h-full'>
                <div className='p-4 space-y-6'>
                    <div>
                        <h3 className='font-medium mb-3'>Upload New Document</h3>
                        {!selectedFile ? (
                            <div
                                className={cn(
                                    'relative rounded-lg border-2 border-dashed p-8 text-center transition-colors',
                                    dragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25',
                                    'bg-background cursor-pointer'
                                )}
                                onDragEnter={handleDrag}
                                onDragLeave={handleDrag}
                                onDragOver={handleDrag}
                                onDrop={handleDrop}
                            >
                                <input
                                    ref={fileInputRef}
                                    id='file-upload'
                                    type='file'
                                    accept='.pdf,.doc,.docx,.txt'
                                    className='hidden'
                                    onChange={handleChange}
                                />

                                <label
                                    htmlFor='file-upload'
                                    className='cursor-pointer block'
                                    onClick={(e) => {
                                        e.preventDefault();
                                        checkAllowedAIAvailable(() => fileInputRef.current?.click());
                                    }}
                                >
                                    <div className='flex flex-col items-center justify-center'>
                                        <Upload size={36} className='mb-2 text-muted-foreground' />
                                        <p className='text-sm font-medium'>Drag & drop</p>
                                        <p className='text-xs text-muted-foreground mt-1'>PDF, Word, or TXT</p>
                                    </div>
                                </label>
                            </div>
                        ) : (
                            <div className='space-y-4'>
                                <div className='flex items-center justify-between p-3 border rounded-md'>
                                    <div className='flex items-center'>
                                        <FileText className='h-5 w-5 mr-2 flex-shrink-0' />
                                        <span className='text-sm truncate max-w-[200px]'>{selectedFile.name}</span>
                                    </div>
                                    <Button
                                        variant='ghost'
                                        size='icon'
                                        onClick={clearFileSelection}
                                        disabled={isUploading}
                                    >
                                        <ChevronRight className='h-4 w-4' />
                                    </Button>
                                </div>

                                <div>
                                    <Label htmlFor='document-name'>Document Name</Label>
                                    <Input
                                        id='document-name'
                                        value={documentName}
                                        onChange={(e) => setDocumentName(e.target.value)}
                                        placeholder='Enter a name for your document'
                                        className='mt-1'
                                        disabled={isUploading}
                                    />
                                </div>

                                <Button className='w-full' onClick={handleUpload} disabled={isUploading}>
                                    {isUploading ? (
                                        <>
                                            <Loader2 className='h-4 w-4 mr-2 animate-spin' />
                                            Uploading...
                                        </>
                                    ) : (
                                        <>
                                            <Upload className='h-4 w-4 mr-2' />
                                            Upload Document
                                        </>
                                    )}
                                </Button>
                            </div>
                        )}
                    </div>

                    <div>
                        <h3 className='font-medium mb-3'>Your Documents</h3>
                        {isLoading ? (
                            <div className='flex justify-center items-center py-8'>
                                <Loader2 className='h-6 w-6 animate-spin text-muted-foreground' />
                            </div>
                        ) : documents.length > 0 ? (
                            <div className='space-y-2'>
                                {documents.map((doc) => (
                                    <Card
                                        key={doc._id}
                                        className={cn(
                                            'cursor-pointer hover:bg-muted/50 transition-colors',
                                            selectedDocument &&
                                                selectedDocument._id === doc._id &&
                                                'border-2 border-primary'
                                        )}
                                        onClick={() => onDocumentSelect(doc)}
                                    >
                                        <CardHeader className='p-3'>
                                            <div className='flex items-start space-x-3'>
                                                <FileText className='h-5 w-5 text-muted-foreground shrink-0 mt-0.5' />
                                                <div className='min-w-0'>
                                                    <CardTitle className='text-sm font-medium truncate'>
                                                        {doc.name}
                                                    </CardTitle>
                                                    <CardDescription className='text-xs'>
                                                        {format(new Date(doc.createdAt), 'MMM d, yyyy')}
                                                    </CardDescription>
                                                </div>
                                            </div>
                                        </CardHeader>
                                    </Card>
                                ))}
                            </div>
                        ) : (
                            <div className='text-center py-6 text-muted-foreground'>
                                <p className='text-sm'>No documents found</p>
                            </div>
                        )}
                    </div>
                </div>
            </ScrollArea>
        </div>
    );
};

export default DocumentSidebar;
