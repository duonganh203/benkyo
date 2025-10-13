// import React, { useState } from 'react';
// import { useParams, useNavigate } from 'react-router-dom';
// import { Button } from '@/components/ui/button';
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import PointsDisplay from '@/components/point-display';
// import { ArrowLeft, BookOpen, Zap } from 'lucide-react';
// import ProgressCard from '@/components/moocs-card';
// import { useUserProgressUi } from '@/hooks/queries/use-get-user-progress-ui';
// import { useGetMoocDetail } from '@/hooks/queries/use-get-mooc-detail';

// const MOOCDetail: React.FC = () => {
//   const { classId, moocId } = useParams<{ classId: string; moocId: string }>();
//   const navigate = useNavigate();

//   const [unlockedDecks] = useState<string[]>(['deck-1']);
//   const { progress } = useUserProgressUi();
//   const userPoints = progress.totalPoints;

//   const { data: mooc, isLoading, isError } = useGetMoocDetail(moocId!);

//   console.log("moocId:", moocId);
//   console.log("classId:", classId);
//   console.log("mooc:", mooc);

//   if (isLoading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center">
//         <p className="text-lg text-muted-foreground">Đang tải dữ liệu MOOC...</p>
//       </div>
//     );
//   }

//   if (isError || !mooc) {
//     return (
//       <div className="min-h-screen flex items-center justify-center">
//         <p className="text-lg text-muted-foreground">Không tìm thấy MOOC</p>
//       </div>
//     );
//   }

//   const handleDeckClick = (deckId: string) => {
//     navigate(`/class/${classId}/mooc/${moocId}/deck/${deckId}`);
//   };

//   const handleQuizHub = (deckId: string) => {
//     navigate(`/class/${classId}/mooc/${moocId}/deck/${deckId}/quiz-hub`);
//   };

//   const handleBackToClass = () => {
//     navigate(`/class/${classId}`);
//   };

//   const getDeckStatus = (deckId: string) => {
//     if (unlockedDecks.includes(deckId)) return 'available';

//     const deck = mooc.data.decks.find((d) => d.id === deckId);
//     if (deck && userPoints >= deck.pointsRequired) return 'available';

//     return 'locked';
//   };

//   return (
//     <div className="min-h-screen bg-background">
//       {/* Header */}
//       <header className="bg-card border-b border-border py-6 px-4">
//         <div className="max-w-4xl mx-auto">
//           {/* <Button variant="ghost" onClick={handleBackToClass} className="mb-4 flex items-center gap-2">
//             <ArrowLeft className="w-4 h-4" />
//             Quay lại lớp học
//           </Button> */}

//           <div className="flex items-start gap-4">
//             <div className="p-3 bg-primary/10 rounded-lg">
//               <BookOpen className="w-8 h-8 text-primary" />
//             </div>
//             <div>
//              <h1 className="text-3xl font-bold text-foreground mb-2">{mooc.title}</h1>
//             <p className="text-lg text-muted-foreground">{mooc.description}</p>

//             </div>
//           </div>
//         </div>
//       </header>

//       {/* Points & Progress */}
//       {/* <section className="py-8 px-4">
//         <div className="max-w-4xl mx-auto space-y-6">
//           <PointsDisplay
//             totalPoints={userPoints}
//             pointsToNextUnlock={
//               mooc.decks.find((d) => !unlockedDecks.includes(d.id) && userPoints < d.pointsRequired)
//                 ? mooc.decks.find((d) => !unlockedDecks.includes(d.id) && userPoints < d.pointsRequired)!
//                     .pointsRequired - userPoints
//                 : undefined
//             }
//             nextUnlockTitle={
//               mooc.decks.find((d) => !unlockedDecks.includes(d.id) && userPoints < d.pointsRequired)?.title
//             }
//           />

//           <Card className="shadow-card">
//             <CardHeader>
//               <CardTitle className="flex items-center gap-2">
//                 <BookOpen className="w-5 h-5" />
//                 Tiến độ học tập
//               </CardTitle>
//             </CardHeader>
//             <CardContent>
//               <div className="space-y-4">
//                 <div className="flex justify-between text-sm">
//                   <span>Tổng tiến độ</span>
//                   <span>{Math.round(mooc.data.progress ?? 0)}%</span>
//                 </div>
//                 <div className="w-full bg-muted rounded-full h-3">
//                   <div
//                     className="gradient-primary h-3 rounded-full transition-all duration-500"
//                     style={{ width: `${mooc.progress}%` }}
//                   />
//                 </div>
//                 <p className="text-sm text-muted-foreground">
//                   Hoàn thành từng bộ thẻ và vượt qua bài kiểm tra để mở khóa cấp độ tiếp theo!
//                 </p>
//               </div>
//             </CardContent>
//           </Card>
//         </div>
//       </section> */}

//       {/* Decks Section */}
//       {/* <section className="py-8 px-4">
//         <div className="max-w-4xl mx-auto">
//           <div className="mb-8">
//             <h2 className="text-2xl font-bold text-foreground mb-2">Các bộ thẻ học tập</h2>
//             <p className="text-muted-foreground">
//               Luyện tập qua flashcard, sau đó làm bài test để tiến lên cấp độ tiếp theo
//             </p>
//           </div>

//           <div className="grid grid-cols-1 gap-6">
//            {mooc.decks.map((deckWrapper) => {
//             const deckStatus = getDeckStatus(deckWrapper.deck._id);
//             const isAvailable = deckStatus === 'available';
//             const deck = deckWrapper.deck;

//             return (
//                 <div key={deck._id} className="space-y-3">
//                 <ProgressCard
//                     title={deck.name} // name của Deck
//                     description={`${deck.description} • ${deck.cardCount} flashcards • ${deckWrapper.pointsRequired ?? 0} điểm cần thiết`}
//                     progress={deckWrapper.completed ? 100 : 0}
//                     status={deckStatus}
//                     onClick={() => isAvailable && handleDeckClick(deck._id)}
//                     testScore={deckWrapper.testScore}
//                 />

//                 {isAvailable && (
//                     <div className="flex justify-end">
//                     <Button
//                         variant="outline"
//                         size="sm"
//                         onClick={() => handleQuizHub(deck._id)}
//                         className="flex items-center gap-2"
//                     >
//                         <Zap className="w-4 h-4" />
//                         Thử thách thêm
//                     </Button>
//                     </div>
//                 )}
//                 </div>
//             );
//             })}

//           </div>

//           {mooc.decks.length === 0 && (
//             <Card className="shadow-card">
//               <CardContent className="p-8 text-center">
//                 <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
//                 <h3 className="text-lg font-semibold text-foreground mb-2">Đang cập nhật</h3>
//                 <p className="text-muted-foreground">Các bộ thẻ cho MOOC này đang được chuẩn bị.</p>
//               </CardContent>
//             </Card>
//           )}
//         </div>
//       </section> */}
//     </div>
//   );
// };

// export default MOOCDetail;

import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { BookOpen, Zap, MoreVertical, Pencil, Trash2 } from 'lucide-react';
import ProgressCard from '@/components/moocs-card';
import { useGetMoocDetail } from '@/hooks/queries/use-get-mooc-detail';
import useMe from '@/hooks/queries/use-me';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';

interface Deck {
    _id: string;
    name: string;
    description?: string;
    cardCount?: number;
    publicStatus?: number;
}

interface DeckWrapper {
    _id: string;
    order?: number;
    pointsRequired?: number;
    deck: Deck;
}

const MOOCDetail: React.FC = () => {
    const { classId, moocId } = useParams<{ classId: string; moocId: string }>();
    const navigate = useNavigate();
    const { data: mooc, isLoading, isError } = useGetMoocDetail(moocId!);
    const { data: user } = useMe();
    const isOwner = mooc ? user?._id === mooc.owner?._id : false;

    console.log('MOOC decks:', mooc?.decks);

    if (isLoading) {
        return (
            <div className='min-h-screen flex items-center justify-center'>
                <p className='text-lg text-muted-foreground'>Đang tải dữ liệu MOOC...</p>
            </div>
        );
    }

    if (isError || !mooc) {
        return (
            <div className='min-h-screen flex items-center justify-center'>
                <p className='text-lg text-muted-foreground'>Không tìm thấy MOOC</p>
            </div>
        );
    }

    const handleEdit = () => {
        navigate(`/moocs/update/${moocId}`);
    };

    const handleDelete = () => {
        if (confirm('Bạn có chắc muốn xoá MOOC này không?')) {
            console.log('Deleting mooc:', moocId);
        }
    };

    const handleGoToDeck = (deckId: string, deckTitle: string) => {
        navigate(`/class/${classId}/mooc/${moocId}/deck/${deckId}`, {
            state: { deckTitle }
        });
    };

    const handleQuizHub = (deckId: string) => {
        navigate(`/class/${classId}/mooc/${moocId}/deck/${deckId}/quiz-hub`);
    };

    return (
        <div className='min-h-screen bg-background'>
            {/* Header */}
            <header className='bg-card border-b border-border py-6 px-4'>
                <div className='max-w-4xl mx-auto flex items-start justify-between'>
                    <div className='flex items-start gap-4'>
                        <div className='p-3 bg-primary/10 rounded-lg'>
                            <BookOpen className='w-8 h-8 text-primary' />
                        </div>
                        <div>
                            <h1 className='text-3xl font-bold text-foreground mb-2'>{mooc.title}</h1>
                            <p className='text-lg text-muted-foreground'>{mooc.description}</p>
                        </div>
                    </div>

                    {/* Chỉ hiện nút Edit/Delete nếu là chủ class */}
                    {isOwner && (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant='ghost'
                                    size='icon'
                                    className='text-muted-foreground hover:text-foreground'
                                >
                                    <MoreVertical className='h-5 w-5' />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align='end' className='w-32'>
                                <DropdownMenuItem onClick={handleEdit}>
                                    <Pencil className='mr-2 h-4 w-4' />
                                    Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    onClick={handleDelete}
                                    className='text-destructive focus:text-destructive'
                                >
                                    <Trash2 className='mr-2 h-4 w-4' />
                                    Delete
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    )}
                </div>
            </header>

            {/* Decks Section */}
            <section className='py-8 px-4'>
                <div className='max-w-4xl mx-auto'>
                    <div className='mb-8'>
                        <h2 className='text-2xl font-bold text-foreground mb-2'>Learning Decks</h2>
                        <p className='text-muted-foreground'>
                            Master each deck through flashcard practice, then take a test to proceed
                        </p>
                    </div>

                    <div className='grid grid-cols-1 gap-6'>
                        {Array.isArray(mooc.decks) && mooc.decks.length > 0 ? (
                            mooc.decks.map((deckWrapper: DeckWrapper) => {
                                const deck = deckWrapper?.deck ?? deckWrapper;
                                if (!deck) return null;

                                return (
                                    <div key={deck._id} className='space-y-3'>
                                        <ProgressCard
                                            title={deck.name ?? 'Không có tên'}
                                            description={`${deck.description ?? ''} • ${
                                                deck.cardCount ?? 0
                                            } flashcards • ${deckWrapper.pointsRequired ?? 0} điểm cần thiết`}
                                            progress={0}
                                            status='available'
                                            onClick={() => handleGoToDeck(deck._id, deck.name)}
                                        />

                                        <div className='flex justify-end'>
                                            <Button
                                                variant='outline'
                                                size='sm'
                                                onClick={() => handleQuizHub(deck._id)}
                                                className='flex items-center gap-2'
                                            >
                                                <Zap className='w-4 h-4' />
                                                Thử thách thêm
                                            </Button>
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <Card className='shadow-card'>
                                <CardContent className='p-8 text-center'>
                                    <BookOpen className='w-12 h-12 text-muted-foreground mx-auto mb-4' />
                                    <h3 className='text-lg font-semibold text-foreground mb-2'>Đang cập nhật</h3>
                                    <p className='text-muted-foreground'>Các bộ thẻ cho MOOC này đang được chuẩn bị.</p>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            </section>
        </div>
    );
};

export default MOOCDetail;
