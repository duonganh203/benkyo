import { ThumbsUp } from 'lucide-react';

interface LikeDeckProps {
    deckData: any;
    currentUser: any;
    liked: boolean;
    totalLikes: number;
    onLike: () => void;
}

export default function LikeDeck({ deckData, currentUser, liked, totalLikes, onLike }: LikeDeckProps) {
    // Hide all if private
    if (deckData.publicStatus === 0) return null;

    const isOwner = currentUser && deckData.owner._id === currentUser._id;
    const isPublic = deckData.publicStatus === 2;

    return (
        <div className='flex items-center gap-2 text-sm'>
            {/* Like button: only for public decks not owned by user */}
            {isPublic && !isOwner && (
                <button
                    type='button'
                    onClick={onLike}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-full border border-border transition-colors shadow-sm
                        ${liked ? 'bg-blue-100 text-blue-600 border-blue-200' : 'bg-muted/60 text-muted-foreground hover:bg-blue-50'}
                    `}
                >
                    <ThumbsUp
                        className={`h-5 w-5 ${liked ? 'fill-blue-500 text-blue-500' : 'text-muted-foreground'}`}
                    />
                    <span className='font-medium'>{liked ? 'Liked' : 'Like'}</span>
                </button>
            )}
            {/* Total likes: always show for public decks */}
            {isPublic && (
                <div className='flex items-center gap-1 px-2 py-0.5 bg-muted/60 border border-border rounded-full shadow-sm min-w-[50px]'>
                    <ThumbsUp className='h-4 w-4 text-blue-500 fill-blue-500' />
                    <span className='font-semibold'>{totalLikes}</span>
                </div>
            )}
        </div>
    );
}
