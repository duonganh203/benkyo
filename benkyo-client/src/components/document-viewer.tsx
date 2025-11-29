import { useState, useEffect } from 'react';
import { X, ZoomIn, ZoomOut, ExternalLink, ChevronLeft, ChevronRight, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Document, Page, pdfjs } from 'react-pdf';
import mammoth from 'mammoth';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

// Set worker path
pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface DocumentViewerProps {
    file: File;
    searchText?: string;
    pageNumber?: number;
    onClose: () => void;
    embedded?: boolean;
}

const DocumentViewer = ({ file, searchText, pageNumber, onClose, embedded = false }: DocumentViewerProps) => {
    const [content, setContent] = useState<string>('');
    const [isPDF, setIsPDF] = useState(false);
    const [isWordDoc, setIsWordDoc] = useState(false);
    const [wordHtml, setWordHtml] = useState<string>('');
    const [pdfUrl, setPdfUrl] = useState<string>('');
    const [zoom, setZoom] = useState(100);
    const [numPages, setNumPages] = useState<number>(0);
    const [currentPage, setCurrentPage] = useState<number>(1);

    useEffect(() => {
        let url: string | undefined;
        const load = async () => {
            if (file.type === 'text/plain') {
                const text = await file.text();
                setContent(text);
                setIsPDF(false);
                setIsWordDoc(false);
            } else if (file.type === 'application/pdf') {
                setIsPDF(true);
                setIsWordDoc(false);
                setContent('');
                url = URL.createObjectURL(file);
                setPdfUrl(url);
                setCurrentPage(pageNumber && pageNumber > 0 ? pageNumber : 1);
            } else if (
                file.type === 'application/msword' ||
                file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
            ) {
                setIsWordDoc(true);
                setIsPDF(false);
                setContent('');

                try {
                    const arrayBuffer = await file.arrayBuffer();
                    const result = await mammoth.convertToHtml({ arrayBuffer });
                    setWordHtml(result.value);
                } catch (error) {
                    console.error('Error converting Word document:', error);
                    setWordHtml(
                        '<p class="text-destructive">Failed to load Word document. Please download to view.</p>'
                    );
                }
            } else {
                try {
                    const text = await file.text();
                    setContent(text);
                    setIsPDF(false);
                    setIsWordDoc(false);
                } catch {
                    setContent('Unsupported file preview. Please download to view.');
                    setIsPDF(false);
                    setIsWordDoc(false);
                }
            }
        };

        load();

        return () => {
            if (url) {
                URL.revokeObjectURL(url);
            }
            setPdfUrl('');
        };
    }, [file, pageNumber]);

    const handleDownload = () => {
        const url = URL.createObjectURL(file);
        const a = document.createElement('a');
        a.href = url;
        a.download = file.name;
        a.click();
        URL.revokeObjectURL(url);
    };

    const onDocumentLoadSuccess = (doc: any) => {
        if (doc && typeof doc.numPages === 'number') {
            setNumPages(doc.numPages);
            setCurrentPage((prev) => {
                const target = pageNumber && pageNumber > 0 ? pageNumber : prev;
                return Math.min(Math.max(1, target), doc.numPages);
            });
        }
    };

    const goToPreviousPage = () => setCurrentPage((p) => Math.max(1, p - 1));
    const goToNextPage = () => setCurrentPage((p) => Math.min(numPages || p, p + 1));

    const containerClass = embedded
        ? 'h-full w-full bg-background flex flex-col'
        : 'fixed inset-y-0 right-0 w-full md:w-1/2 lg:w-2/5 bg-background border-l shadow-lg z-50 flex flex-col';

    return (
        <div className={containerClass}>
            <div className='flex items-center justify-between p-4 border-b flex-shrink-0'>
                <div className='flex items-center gap-2 flex-1 min-w-0'>
                    <h3 className='font-semibold truncate'>{file.name}</h3>
                    {isPDF && numPages > 0 && (
                        <span className='text-xs text-muted-foreground whitespace-nowrap'>
                            Page {currentPage} / {numPages}
                        </span>
                    )}
                </div>

                <div className='flex items-center gap-2'>
                    {isPDF && numPages > 0 && (
                        <>
                            <Button size='icon' variant='ghost' onClick={goToPreviousPage} disabled={currentPage <= 1}>
                                <ChevronLeft className='h-4 w-4' />
                            </Button>
                            <Button
                                size='icon'
                                variant='ghost'
                                onClick={goToNextPage}
                                disabled={numPages === 0 || currentPage >= numPages}
                            >
                                <ChevronRight className='h-4 w-4' />
                            </Button>
                        </>
                    )}

                    <Button size='icon' variant='ghost' onClick={() => setZoom((z) => Math.max(50, z - 10))}>
                        <ZoomOut className='h-4 w-4' />
                    </Button>

                    <span className='text-sm min-w-[3rem] text-center'>{zoom}%</span>

                    <Button size='icon' variant='ghost' onClick={() => setZoom((z) => Math.min(300, z + 10))}>
                        <ZoomIn className='h-4 w-4' />
                    </Button>

                    <Button size='icon' variant='ghost' onClick={handleDownload}>
                        <ExternalLink className='h-4 w-4' />
                    </Button>

                    {!embedded && (
                        <Button size='icon' variant='ghost' onClick={onClose}>
                            <X className='h-4 w-4' />
                        </Button>
                    )}
                </div>
            </div>

            <div className='flex-1 min-h-0 overflow-y-auto'>
                <div className='p-6'>
                    {isPDF ? (
                        <>
                            <div className='flex items-center justify-center'>
                                {pdfUrl ? (
                                    <div className='mx-auto'>
                                        <Document
                                            file={pdfUrl}
                                            onLoadSuccess={onDocumentLoadSuccess}
                                            loading={
                                                <div className='text-center py-8 text-muted-foreground'>
                                                    Loading PDF...
                                                </div>
                                            }
                                            error={
                                                <div className='text-center py-8 space-y-4'>
                                                    <p className='text-destructive'>Failed to load PDF</p>
                                                    <Button onClick={handleDownload} variant='outline' className='mt-2'>
                                                        <Download className='h-4 w-4 mr-2' />
                                                        Download PDF
                                                    </Button>
                                                </div>
                                            }
                                        >
                                            <Page
                                                pageNumber={currentPage}
                                                scale={zoom / 100}
                                                renderTextLayer={true}
                                                renderAnnotationLayer={true}
                                            />
                                        </Document>
                                    </div>
                                ) : (
                                    <div className='text-center text-muted-foreground'>Preparing PDF preview...</div>
                                )}
                            </div>

                            {searchText && (
                                <div className='mt-4 bg-muted p-4 rounded-lg max-w-full w-full'>
                                    <p className='text-xs text-muted-foreground mb-2 font-medium'>Source excerpt:</p>
                                    <p className='text-sm italic'>{searchText}</p>
                                    <div className='mt-2 text-xs text-muted-foreground'>
                                        {pageNumber ? `Found on page ${pageNumber}` : ''}
                                    </div>
                                </div>
                            )}
                        </>
                    ) : isWordDoc ? (
                        <div className='space-y-4'>
                            {searchText && (
                                <div className='bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-400 p-4 rounded'>
                                    <p className='text-xs font-semibold text-yellow-800 dark:text-yellow-200 mb-2'>
                                        Source excerpt from AI:
                                    </p>
                                    <p className='text-sm text-yellow-900 dark:text-yellow-100 italic'>
                                        "{searchText}"
                                    </p>
                                    {pageNumber && (
                                        <p className='text-xs text-yellow-700 dark:text-yellow-300 mt-2'>
                                            Found on page/section {pageNumber}
                                        </p>
                                    )}
                                </div>
                            )}
                            <div
                                id='document-content'
                                className='prose dark:prose-invert max-w-none'
                                style={{ fontSize: `${zoom}%` }}
                                dangerouslySetInnerHTML={{ __html: wordHtml }}
                            />
                        </div>
                    ) : (
                        <div className='space-y-4'>
                            {searchText && (
                                <div className='bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-400 p-4 rounded sticky top-0 z-10'>
                                    <p className='text-xs font-semibold text-yellow-800 dark:text-yellow-200 mb-2'>
                                        📍 Source excerpt from AI:
                                    </p>
                                    <p className='text-sm text-yellow-900 dark:text-yellow-100 italic'>
                                        "{searchText}"
                                    </p>
                                    {pageNumber && (
                                        <p className='text-xs text-yellow-700 dark:text-yellow-300 mt-2'>
                                            Found on page/section {pageNumber}
                                        </p>
                                    )}
                                </div>
                            )}
                            <div
                                id='document-content'
                                className='prose dark:prose-invert max-w-none whitespace-pre-wrap'
                                style={{ fontSize: `${zoom}%` }}
                            >
                                {content || 'Loading document...'}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DocumentViewer;
