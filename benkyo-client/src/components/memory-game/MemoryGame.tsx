import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Brain, CheckCircle2, XCircle } from 'lucide-react';

type Difficulty = 'easy' | 'medium' | 'hard';

type DifficultySettings = {
    gridSize: number;
    initialSequenceLength: number;
    displayTime: number;
    interval: number;
};

const difficultySettings: Record<Difficulty, DifficultySettings> = {
    easy: { gridSize: 3, initialSequenceLength: 1, displayTime: 1000, interval: 800 },
    medium: { gridSize: 4, initialSequenceLength: 1, displayTime: 800, interval: 600 },
    hard: { gridSize: 5, initialSequenceLength: 1, displayTime: 600, interval: 400 }
};

const generateSequence = (length: number, totalTiles: number) => {
    return Array.from({ length }, () => Math.floor(Math.random() * totalTiles) + 1);
};

const MemoryGame = () => {
    const [difficulty, setDifficulty] = useState<Difficulty>('easy');
    const [gameState, setGameState] = useState<'idle' | 'showing' | 'input' | 'success' | 'fail'>('idle');
    const [sequence, setSequence] = useState<number[]>([]);
    const [playerSequence, setPlayerSequence] = useState<number[]>([]);
    const [currentPosition, setCurrentPosition] = useState<number | null>(null);
    const [clickedTile, setClickedTile] = useState<number | null>(null);
    const [score, setScore] = useState(0);
    const [level, setLevel] = useState(1);
    const [mounted, setMounted] = useState(false);

    const startButtonRef = useRef<HTMLButtonElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (startButtonRef.current) {
            startButtonRef.current.focus();
        }
        setTimeout(() => setMounted(true), 10);
    }, []);

    const startGame = (continueGame = false) => {
        const settings = difficultySettings[difficulty];
        const totalTiles = settings.gridSize * settings.gridSize;
        const sequenceLength = continueGame ? level : 1;

        const newSequence = generateSequence(sequenceLength, totalTiles);
        setSequence(newSequence);
        setPlayerSequence([]);
        setGameState('showing');

        let currentIndex = 0;
        const intervalId = setInterval(() => {
            if (currentIndex < newSequence.length) {
                setCurrentPosition(newSequence[currentIndex]);
                setTimeout(() => setCurrentPosition(null), settings.displayTime);
                currentIndex++;
            } else {
                clearInterval(intervalId);
                setCurrentPosition(null);
                setGameState('input');
            }
        }, settings.displayTime + settings.interval);
    };

    const handleTileClick = (tileNumber: number) => {
        if (gameState !== 'input') return;

        setClickedTile(tileNumber);
        setTimeout(() => setClickedTile(null), 200);

        const newPlayerSequence = [...playerSequence, tileNumber];
        setPlayerSequence(newPlayerSequence);

        if (tileNumber !== sequence[playerSequence.length]) {
            setGameState('fail');
            return;
        }

        if (newPlayerSequence.length === sequence.length) {
            setScore(score + sequence.length);
            setGameState('success');
            setLevel((prev) => prev + 1);
            setTimeout(() => startGame(true), 1000);
        } else {
            setPlayerSequence(newPlayerSequence);
        }
    };

    const getGameMessage = () => {
        switch (gameState) {
            case 'idle':
                return 'Select difficulty and press Start to play';
            case 'showing':
                return 'Watch the sequence carefully...';
            case 'input':
                return 'Now repeat the sequence!';
            case 'success':
                return `Great job! Moving to level ${level + 1}...`;
            case 'fail':
                return 'Oops! That was incorrect. Try again!';
            default:
                return '';
        }
    };

    const isHighlighted = (tileNumber: number) => {
        return currentPosition === tileNumber;
    };

    const isClicked = (tileNumber: number) => {
        return clickedTile === tileNumber;
    };

    const resetGame = () => {
        setScore(0);
        setLevel(1);
        startGame();
    };

    const gridSize = difficultySettings[difficulty].gridSize;
    const totalTiles = gridSize * gridSize;

    const renderGrid = () => {
        return Array.from({ length: totalTiles }, (_, index) => {
            const tileNumber = index + 1;
            return (
                <button
                    key={tileNumber}
                    className={`aspect-square rounded-md transition-all transform duration-150
                        ${isHighlighted(tileNumber) ? 'bg-primary scale-95' : 'bg-secondary hover:bg-secondary/80'}
                        ${isClicked(tileNumber) ? 'bg-primary/80 scale-90' : ''}
                        ${gameState === 'input' ? 'cursor-pointer' : 'cursor-default'}`}
                    onClick={() => handleTileClick(tileNumber)}
                    disabled={gameState !== 'input'}
                    aria-label={`Tile ${tileNumber}`}
                />
            );
        });
    };

    return (
        <Card
            id='memory-game'
            ref={containerRef}
            className={`border-2 border-primary/20 mt-8 transition-all duration-500 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
        >
            <CardContent className='p-6'>
                <div className='flex items-center justify-between mb-6'>
                    <div className='flex items-center'>
                        <Brain className='h-6 w-6 text-primary mr-2' />
                        <h3 className='text-xl font-medium'>Memory Sequence Game</h3>
                    </div>
                    <div className='text-sm font-medium'>
                        Level: <span className='text-primary'>{level}</span>
                    </div>
                </div>

                <div className='text-sm text-muted-foreground text-center mb-4'>{getGameMessage()}</div>

                <div className='flex justify-center mb-6'>
                    <div
                        className={`grid gap-2 w-full max-w-md aspect-square relative`}
                        style={{ gridTemplateColumns: `repeat(${gridSize}, 1fr)` }}
                    >
                        {renderGrid()}
                    </div>
                </div>

                {gameState === 'success' && (
                    <div className='flex justify-center items-center text-sm text-emerald-500 mb-4'>
                        <CheckCircle2 className='h-5 w-5 mr-1.5' />
                        <span>Sequence complete! Score: {score}</span>
                    </div>
                )}

                {gameState === 'fail' && (
                    <div className='flex justify-center items-center text-sm text-red-500 mb-4'>
                        <XCircle className='h-5 w-5 mr-1.5' />
                        <span>Wrong sequence. Final Score: {score}</span>
                    </div>
                )}

                <div className='flex flex-col sm:flex-row items-center gap-4 justify-between'>
                    <div className='flex flex-col gap-2 w-full sm:w-auto'>
                        <Label htmlFor='difficulty' className='text-sm'>
                            Difficulty
                        </Label>
                        <Select
                            value={difficulty}
                            onValueChange={(value: Difficulty) => {
                                setDifficulty(value);
                                if (gameState !== 'idle') {
                                    setLevel(1);
                                    setScore(0);
                                }
                            }}
                            disabled={gameState === 'showing'}
                        >
                            <SelectTrigger id='difficulty' className='w-[180px]'>
                                <SelectValue placeholder='Select difficulty' />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value='easy'>Easy (3×3 grid)</SelectItem>
                                <SelectItem value='medium'>Medium (4×4 grid)</SelectItem>
                                <SelectItem value='hard'>Hard (5×5 grid)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className='text-center text-sm font-medium'>Score: {score}</div>

                    <Button
                        ref={startButtonRef}
                        onClick={gameState === 'fail' ? resetGame : () => startGame()}
                        disabled={gameState === 'showing' || gameState === 'success'}
                        className='w-full sm:w-auto'
                    >
                        {gameState === 'idle' ? 'Start Game' : gameState === 'fail' ? 'Try Again' : 'Restart Game'}
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
};

export default MemoryGame;
