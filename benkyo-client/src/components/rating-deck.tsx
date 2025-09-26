import { useState } from 'react';
import { ThumbsUp } from 'lucide-react';

interface User {
    _id: string;
    name?: string;
    avatar?: string;
}

interface DeckData {
    _id: string;
    owner: User;
    publicStatus: number; // 0 = private, 1 = pending, 2 = approved
    likeCount: number;
    likes?: string[]; // mảng userId đã like
}

interface LikeDeckProps {
    deckData: DeckData;
    currentUser?: User;
    onLikeApi: (deckId: string, liked: boolean) => Promise<void>; // API call
}

export default function LikeDeck({ deckData, currentUser, onLikeApi }: LikeDeckProps) {
    if (!deckData || deckData.publicStatus === 0) return null;

    const isOwner = currentUser?._id === deckData.owner._id;
    const isPublic = deckData.publicStatus === 2;

    // initial state dựa trên backend
    const initialLiked =
        currentUser && Array.isArray(deckData.likes) ? deckData.likes.some((id) => id === currentUser._id) : false;

    const [liked, setLiked] = useState<boolean>(initialLiked);
    const [totalLikes, setTotalLikes] = useState<number>(deckData.likeCount ?? 0);
    const [loading, setLoading] = useState<boolean>(false);

    const handleLike = async () => {
        if (!currentUser || loading) return;

        // lưu giá trị cũ để rollback nếu lỗi
        const prevLiked = liked;
        const prevTotalLikes = totalLikes;

        // optimistic update
        const newLiked = !liked;
        setLiked(newLiked);
        setTotalLikes((prev) => (newLiked ? prev + 1 : prev - 1));

        setLoading(true);
        try {
            await onLikeApi(deckData._id, newLiked); // gọi API
        } catch (err) {
            // rollback nếu API fail
            setLiked(prevLiked);
            setTotalLikes(prevTotalLikes);
            console.error('Failed to update like:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className='flex items-center gap-2 text-sm'>
            {isPublic && !isOwner && (
                <button
                    type='button'
                    onClick={handleLike}
                    disabled={loading}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-full border border-border transition-colors shadow-sm
            ${liked ? 'bg-blue-100 text-blue-600 border-blue-200' : 'bg-muted/60 text-muted-foreground hover:bg-blue-50'}`}
                >
                    <ThumbsUp
                        className={`h-5 w-5 ${liked ? 'fill-blue-500 text-blue-500' : 'text-muted-foreground'}`}
                    />
                    <span className='font-medium'>{liked ? 'Liked' : 'Like'}</span>
                </button>
            )}

            {isPublic && (
                <div className='flex items-center gap-1 px-2 py-0.5 bg-muted/60 border border-border rounded-full shadow-sm min-w-[50px]'>
                    <ThumbsUp className='h-4 w-4 text-blue-500 fill-blue-500' />
                    <span className='font-semibold'>{totalLikes}</span>
                </div>
            )}
        </div>
    );
}
