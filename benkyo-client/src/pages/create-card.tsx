import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getToast } from '@/utils/getToast';
import useGetDeckById from '@/hooks/queries/use-get-deck-id';
import useBatchCreateCards from '@/hooks/queries/use-batch-create-cards';
import { BatchImportCard } from '@/types/card';
import AIFlashcardGenerator from '@/components/ai-flashcard-generator';
import ManualEntryForm from '@/components/forms/manual-entry-form';
import BatchImportForm from '@/components/forms/batch-import-form';
import ImportConfirmDialog from '@/components/modals/import-confirm-dialog';

const CreateCard = () => {
    const { deckId } = useParams<{ deckId: string }>();
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const [importCards, setImportCards] = useState<BatchImportCard[]>([]);
    const [importDialogOpen, setImportDialogOpen] = useState<boolean>(false);
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [activeTab, setActiveTab] = useState<string>('manual');

    const { data: deckData } = useGetDeckById(deckId!);
    const { mutateAsync: batchCreateCardsMutation, isPending: isBatchCreating } = useBatchCreateCards();

    const handleBatchImport = async () => {
        if (importCards.length === 0) {
            getToast('error', 'No valid cards to import');
            return;
        }

        setIsSubmitting(true);
        batchCreateCardsMutation(
            {
                cards: importCards,
                deckId: deckId || ''
            },
            {
                onSuccess: (data) => {
                    getToast('success', `Successfully created ${data.cardsCreated} cards`);
                    queryClient.invalidateQueries({ queryKey: ['deckCards', deckId] });
                    setImportCards([]);
                    setImportDialogOpen(false);
                    setIsSubmitting(false);
                },
                onError: (error) => {
                    getToast('error', error.message || 'Failed to import cards');
                    console.error(error);
                    setIsSubmitting(false);
                }
            }
        );
    };

    return (
        <div className='max-w-3xl h-full flex flex-col justify-center mx-auto py-8 px-4 animate-fade-in'>
            <div className='flex items-center justify-between mb-6 animate-slide-down'>
                <div className='flex items-center gap-2'>
                    <Button
                        variant='ghost'
                        size='icon'
                        onClick={() => navigate(`/deck/${deckId}`)}
                        className='hover:scale-105 active:scale-95 transition-all'
                    >
                        <ChevronLeft className='h-5 w-5' />
                    </Button>
                    <div>
                        <h1 className='text-2xl font-bold'>Add Cards</h1>
                        <p className='text-muted-foreground'>Deck: {deckData?.name || 'Loading...'}</p>
                    </div>
                </div>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className='w-full animate-fade-in animation-delay-200'>
                <TabsList className='grid w-full grid-cols-3 mb-6'>
                    <TabsTrigger value='manual' className='transition-all hover:bg-accent/80'>
                        Manual Entry
                    </TabsTrigger>
                    <TabsTrigger value='import' className='transition-all hover:bg-accent/80'>
                        Batch Import
                    </TabsTrigger>
                    <TabsTrigger value='ai' className='transition-all hover:bg-accent/80'>
                        AI Generator
                    </TabsTrigger>
                </TabsList>

                <TabsContent value='manual' className='space-y-4 animate-fade-in'>
                    <ManualEntryForm deckId={deckId || ''} />
                </TabsContent>

                <TabsContent value='import' className='space-y-4 animate-fade-in' id='import-section'>
                    <BatchImportForm
                        onImportConfirm={() => setImportDialogOpen(true)}
                        importCards={importCards}
                        setImportCards={setImportCards}
                    />
                </TabsContent>

                <TabsContent value='ai' className='space-y-4 animate-fade-in'>
                    <Card className='border-none shadow-none bg-transparent transition-all'>
                        <CardContent className='p-0'>
                            <AIFlashcardGenerator />
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            <ImportConfirmDialog
                isOpen={importDialogOpen}
                onOpenChange={setImportDialogOpen}
                onConfirm={handleBatchImport}
                isSubmitting={isSubmitting || isBatchCreating}
                cardCount={importCards.length}
                deckName={deckData?.name || ''}
            />
        </div>
    );
};

export default CreateCard;
