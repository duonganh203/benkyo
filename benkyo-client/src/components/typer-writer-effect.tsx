import '../markdown.css';
import { useState, useEffect } from 'react';
import Markdown from 'marked-react';

interface TypewriterEffectProps {
    content: string;
    speed?: number;
    className?: string;
    onTypingUpdate?: (isTyping: boolean, progress: number) => void;
}

export const TypewriterEffect = ({ content, speed = 10, className, onTypingUpdate }: TypewriterEffectProps) => {
    const [displayedContent, setDisplayedContent] = useState('');
    const [isComplete, setIsComplete] = useState(false);

    useEffect(() => {
        let currentIndex = 0;
        setDisplayedContent('');
        setIsComplete(false);

        const interval = setInterval(() => {
            if (currentIndex < content.length) {
                setDisplayedContent((prev) => prev + content[currentIndex]);
                currentIndex++;

                if (onTypingUpdate) {
                    const progress = currentIndex / content.length;
                    onTypingUpdate(true, progress);
                }
            } else {
                clearInterval(interval);
                setIsComplete(true);
                if (onTypingUpdate) {
                    onTypingUpdate(false, 1);
                }
            }
        }, speed);

        return () => clearInterval(interval);
    }, [content, speed, onTypingUpdate]);

    return (
        <div className={className}>
            {isComplete ? (
                <Markdown>{content}</Markdown>
            ) : (
                <div className='whitespace-pre-wrap'>{displayedContent}</div>
            )}
        </div>
    );
};
