import '../markdown.css';
import { useState, useRef, useEffect } from 'react';
import { Send, Loader2, FileText, X, ChevronDown, Cat } from 'lucide-react';
import Markdown from 'marked-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { getToast } from '@/utils/getToast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import useChatWithDocument from '@/hooks/queries/use-chat-with-document';
import useAuthStore from '@/hooks/stores/use-auth-store';
import useGetAllConversations from '@/hooks/queries/use-get-all-conversations';
import { ConversationRes } from '@/types/chat';
import { TypingIndicator } from './typing-animation';
import { TypewriterEffect } from './typer-writer-effect';

interface ChatInterfaceProps {
    documentId: string;
    documentName: string;
    onChangeDocument: () => void;
}

interface Message {
    id: string;
    content: string;
    sender: 'user' | 'assistant';
    timestamp: Date;
    isTyping?: boolean;
    showTypewriter?: boolean;
    hasAnimated?: boolean;
}

export default function ChatInterface({
    documentId,
    documentName,
    onChangeDocument
}: ChatInterfaceProps): React.ReactElement {
    const { user } = useAuthStore((store) => store);
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputValue, setInputValue] = useState('');
    const [showScrollButton, setShowScrollButton] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const scrollAreaRef = useRef<HTMLDivElement>(null);
    const exampleQuestions = [
        'What are the main topics covered in this document?',
        'Can you summarize the key points?',
        'Explain the concept of [topic] mentioned in the document'
    ];

    const { mutateAsync: chatMutation, isPending: isLoading } = useChatWithDocument();
    const { data: conversations, isLoading: isConversationsLoading } = useGetAllConversations(documentId);
    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        if (conversations && Array.isArray(conversations)) {
            const conversationMessages = conversations
                .map((conv: ConversationRes) => [
                    {
                        id: `user-${conv._id}`,
                        content: conv.question,
                        sender: 'user' as const,
                        timestamp: new Date(conv.createdAt)
                    },
                    {
                        id: `assistant-${conv._id}`,
                        content: conv.response,
                        sender: 'assistant' as const,
                        timestamp: new Date(conv.createdAt)
                    }
                ])
                .flat();

            setMessages(conversationMessages);
        }
    }, [conversations, documentId]);

    const scrollToBottom = () => {
        if (messagesEndRef.current) {
            setTimeout(() => {
                messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
                setShowScrollButton(false);
            }, 100);
        }
    };

    const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
        const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
        const isScrolledUp = scrollHeight - scrollTop - clientHeight > 200;
        setShowScrollButton(isScrolledUp);
    };

    const markMessageAsAnimated = (messageId: string) => {
        setMessages((prevMessages) =>
            prevMessages.map((msg) => (msg.id === messageId ? { ...msg, hasAnimated: true } : msg))
        );
    };

    const handleSubmit = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!inputValue.trim() || isLoading) return;

        const userMessage: Message = {
            id: `user-${Date.now()}`,
            content: inputValue.trim(),
            sender: 'user',
            timestamp: new Date()
        };

        setMessages((prev) => [...prev, userMessage]);
        setInputValue('');

        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
        }
        const typingIndicatorId = `typing-${Date.now()}`;
        setMessages((prev) => [
            ...prev,
            {
                id: typingIndicatorId,
                content: '',
                sender: 'assistant',
                timestamp: new Date(),
                isTyping: true
            }
        ]);

        const response = await chatMutation(
            {
                documentId,
                question: userMessage.content
            },
            {
                onSuccess: () => {
                    setMessages((prev) => {
                        const filteredMessages = prev.filter((msg) => msg.id !== typingIndicatorId);
                        return [
                            ...filteredMessages,
                            {
                                id: `assistant-${Date.now()}`,
                                content: response.response,
                                sender: 'assistant',
                                timestamp: new Date(),
                                showTypewriter: true,
                                hasAnimated: false
                            }
                        ];
                    });
                },
                onError: (err) => {
                    getToast('error', err.response?.data?.message || 'Failed to get response. Please try again.');
                    setMessages((prev) => {
                        const filteredMessages = prev.filter((msg) => !msg.isTyping);
                        return [
                            ...filteredMessages,
                            {
                                id: `error-${Date.now()}`,
                                content: 'Sorry, I encountered an error processing your request. Please try again.',
                                sender: 'assistant',
                                timestamp: new Date()
                            }
                        ];
                    });
                }
            }
        );
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit();
        }
    };

    const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setInputValue(e.target.value);

        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 150)}px`;
        }
    };
    return (
        <div className='flex flex-col h-[calc(100vh-4rem)]'>
            <div className='border-b p-3 flex justify-between items-center bg-muted/30'>
                <div className='flex items-center space-x-2'>
                    <FileText className='h-4 w-4' />
                    <span className='font-medium text-sm max-w-[200px] truncate'>{documentName}</span>
                </div>
                <div className='flex gap-2'>
                    {messages.length > 0 && (
                        <Button
                            size='sm'
                            variant='ghost'
                            onClick={() => setMessages([])}
                            className='text-muted-foreground hover:text-destructive'
                        >
                            Clear Chat
                        </Button>
                    )}
                    <Button size='sm' variant='outline' onClick={onChangeDocument}>
                        <X className='h-3 w-3 mr-1' />
                        Change
                    </Button>
                </div>
            </div>

            <div className='relative flex-1 h-[calc(100vh-15rem)]'>
                <ScrollArea
                    className='flex-1 p-4 overflow-y-hidden h-full'
                    type='always'
                    onScroll={handleScroll}
                    ref={scrollAreaRef}
                >
                    {isConversationsLoading ? (
                        <div className='h-full flex flex-col items-center justify-center'>
                            <div className='flex flex-col items-center gap-4'>
                                <Loader2 className='h-8 w-8 animate-spin text-primary' />
                                <p className='text-muted-foreground'>Loading conversation history...</p>
                            </div>
                        </div>
                    ) : messages.length === 0 ? (
                        <div className='h-full flex flex-col items-center justify-center'>
                            <div className='max-w-md text-center space-y-5'>
                                <div className='mx-auto bg-primary/10 p-3 rounded-full w-16 h-16 flex items-center justify-center'>
                                    <Cat className='h-8 w-8 text-primary' />
                                </div>
                                <h2 className='text-xl font-semibold'>Chat with {documentName}</h2>
                                <p className='text-muted-foreground'>
                                    Ask questions about this document and I'll help you understand the content better.
                                </p>

                                <div className='pt-4'>
                                    <h3 className='text-sm font-medium mb-3'>Examples</h3>
                                    <div className='grid gap-2'>
                                        {exampleQuestions.map((example, index) => (
                                            <Button
                                                key={index}
                                                variant='ghost'
                                                className=' p-3 text-sm rounded-lg text-primary/50'
                                                onClick={() => {
                                                    setInputValue(example);
                                                    if (textareaRef.current) {
                                                        textareaRef.current.focus();
                                                        textareaRef.current.style.height = 'auto';
                                                        textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 150)}px`;
                                                    }
                                                }}
                                            >
                                                {example}
                                            </Button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className='max-w-3xl mx-auto space-y-6'>
                            {messages.map((message) => (
                                <div
                                    key={message.id}
                                    className={cn(
                                        'flex message-container',
                                        message.sender === 'user' ? 'justify-end' : 'justify-start'
                                    )}
                                >
                                    <div
                                        className={cn(
                                            'flex max-w-[80%] space-x-2',
                                            message.sender === 'user' ? 'flex-row-reverse space-x-reverse' : 'flex-row'
                                        )}
                                    >
                                        <Avatar
                                            className={cn(
                                                'message-avatar h-8 w-8 ',
                                                message.sender === 'assistant' ? 'text-primary-foreground' : 'bg-muted'
                                            )}
                                        >
                                            <AvatarImage
                                                src={cn(
                                                    `${message.sender === 'user' ? user?.avatar : '/images/ai.jpg'}`
                                                )}
                                                alt='avatar'
                                            />
                                            <AvatarFallback>
                                                {message.sender === 'assistant' ? 'AI' : 'U'}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div
                                            className={cn(
                                                'rounded-lg px-4 py-3',
                                                message.sender === 'user'
                                                    ? 'bg-primary text-primary-foreground'
                                                    : 'bg-muted/50 border shadow-sm'
                                            )}
                                        >
                                            <div className='text-base markdown-content'>
                                                {message.isTyping ? (
                                                    <TypingIndicator />
                                                ) : message.sender === 'assistant' ? (
                                                    <div className='prose prose-base dark:prose-invert max-w-none'>
                                                        {message.showTypewriter && !message.hasAnimated ? (
                                                            <TypewriterEffect
                                                                content={message.content}
                                                                speed={5}
                                                                onTypingUpdate={(isTyping, progress) => {
                                                                    if (progress > 0.1 && progress % 0.2 < 0.01) {
                                                                        scrollToBottom();
                                                                    }
                                                                    if (!isTyping) {
                                                                        scrollToBottom();
                                                                        markMessageAsAnimated(message.id);
                                                                    }
                                                                }}
                                                            />
                                                        ) : (
                                                            <Markdown>{message.content}</Markdown>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <div className='whitespace-pre-line'>{message.content}</div>
                                                )}
                                            </div>
                                            <div className='text-xs opacity-70 mt-1'>
                                                {message.timestamp.toLocaleString([], {
                                                    month: 'short',
                                                    day: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            <div ref={messagesEndRef} className='h-4' />
                        </div>
                    )}
                </ScrollArea>

                {showScrollButton && (
                    <Button
                        className='absolute bottom-4 right-4 rounded-full shadow-md'
                        size='icon'
                        onClick={() => scrollToBottom()}
                    >
                        <ChevronDown className='h-4 w-4' />
                    </Button>
                )}
            </div>

            <div className='border-t p-4 bg-background/20 backdrop-blur-sm dark:bg-background/20'>
                <form onSubmit={(e) => handleSubmit(e)} className='max-w-3xl mx-auto'>
                    <div className='relative'>
                        <Textarea
                            ref={textareaRef}
                            value={inputValue}
                            onChange={handleTextareaChange}
                            onKeyDown={handleKeyDown}
                            placeholder='Ask a question about the document...'
                            className='min-h-[60px] max-h-[150px] resize-none pr-12 py-3 text-base rounded-xl shadow-sm '
                            disabled={isLoading}
                        />
                        <Button
                            type='submit'
                            size='icon'
                            disabled={!inputValue.trim() || isLoading}
                            className='h-8 w-8 absolute right-2 bottom-2 rounded-full'
                        >
                            {isLoading ? <Loader2 className='h-4 w-4 animate-spin' /> : <Send className='h-4 w-4' />}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
