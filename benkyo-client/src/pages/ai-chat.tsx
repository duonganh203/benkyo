import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, PanelRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import ChatInterface from '@/components/chat-interface';
import DocumentSidebar from '@/components/document-sidebar';
import { Document } from '@/types/document';
import { getToast } from '@/utils/getToast';
import useGetDocuments from '@/hooks/queries/use-get-documents';
import useUploadDocument from '@/hooks/queries/use-upload-document';

const AIChat = () => {
    const navigate = useNavigate();
    const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const queryClient = useQueryClient();

    const { data: documents = [], isLoading } = useGetDocuments();

    const { mutateAsync: uploadMutation, isPending: isUploading } = useUploadDocument();

    const handleDocumentSelect = (document: Document) => {
        setSelectedDocument(document);
        getToast('success', `Document "${document.name}" selected`);
    };

    const handleFileUpload = async (file: File, documentName: string) => {
        const formData = new FormData();
        formData.append('document', file);
        formData.append('documentName', documentName);

        const uploadedDocument = await uploadMutation(formData, {
            onSuccess: async () => {
                getToast('success', `Document "${documentName}" uploaded successfully`);
                await queryClient.invalidateQueries({ queryKey: ['documents'] });
                setSelectedDocument(uploadedDocument);
            },
            onError: (error) => {
                getToast('error', error.message || 'Failed to upload document');
                throw error;
            }
        });
        return uploadedDocument;
    };

    const toggleSidebar = () => {
        setSidebarOpen(!sidebarOpen);
    };

    return (
        <div className='min-h-screen bg-background flex flex-col'>
            <div className='flex flex-1 h-[calc(100vh-4rem)] overflow-hidden'>
                <main className='w-[80%] flex flex-col'>
                    <div className='border-b p-4 flex items-center justify-between'>
                        <div className='flex items-center space-x-4'>
                            {/* <Button variant='ghost' size='icon' onClick={() => navigate(-1)} className='h-8 w-8'>
                                <ChevronLeft className='h-4 w-4' />
                                <span className='sr-only'>Back</span>
                            </Button> */}
                            <h1 className='text-xl font-bold tracking-tight'>Chat with SUPER CAT</h1>
                        </div>
                        <Button variant='outline' size='icon' onClick={toggleSidebar} className='md:hidden'>
                            <PanelRight className='h-4 w-4' />
                        </Button>
                    </div>

                    <div className='flex-1 overflow-hidden'>
                        {!selectedDocument ? (
                            <div className='flex items-center justify-center h-full'>
                                <div className='text-center max-w-md p-6'>
                                    <h2 className='text-2xl font-bold mb-2'>Select a Document</h2>
                                    <p className='text-muted-foreground'>
                                        Choose a document from the sidebar to start chatting about its content.
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <ChatInterface
                                documentId={selectedDocument._id}
                                documentName={selectedDocument.name}
                                onChangeDocument={() => setSelectedDocument(null)}
                            />
                        )}
                    </div>
                </main>

                <div className='border-l w-[20%] p-0 md:w-96 flex-shrink-0 transition-all duration-300 overflow-hidden'>
                    <div className='w-full h-[100vh] overflow-hidden'>
                        <DocumentSidebar
                            documents={documents || []}
                            isLoading={isLoading}
                            isUploading={isUploading}
                            onDocumentSelect={handleDocumentSelect}
                            onFileUpload={handleFileUpload}
                            onToggle={toggleSidebar}
                            selectedDocument={selectedDocument}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AIChat;
