import { Mooc, Class, Deck, Card, PublicStatus } from '~/schemas';
import { Types } from 'mongoose';

export const createMoocService = async (data: {
    title: string;
    description?: string;
    owner: string;
    class?: string;
    isPaid?: boolean;
    price?: number;
    currency?: string;
    publicStatus?: number; // 0 = private, 2 = public
    decks?: {
        name: string;
        description?: string;
        order: number;
        cards?: { front: string; back: string; tags?: string[] }[];
    }[];
}) => {
    try {
        const createdDecks: { deck: string; order: number }[] = [];
        let classInfo = null;

        if (data.class) {
            classInfo = await Class.findById(data.class);
            if (!classInfo) {
                return {
                    success: false,
                    message: `Class with ID ${data.class} not found`,
                    data: null
                };
            }
        }

        const isMoocPublic = data.publicStatus === 2;

        if (data.decks && data.decks.length > 0) {
            for (const deckData of data.decks) {
                const deck = new Deck({
                    name: deckData.name,
                    description: deckData.description,
                    owner: data.owner,
                    publicStatus: isMoocPublic ? 2 : 0, // deck cũng public nếu MOOC public
                    isPublic: isMoocPublic
                });

                const savedDeck = await deck.save();

                if (deckData.cards && deckData.cards.length > 0) {
                    const cardsToCreate = deckData.cards.map((card) => ({
                        deck: savedDeck._id,
                        front: card.front,
                        back: card.back,
                        tags: card.tags || []
                    }));

                    await Card.insertMany(cardsToCreate);
                    savedDeck.cardCount = cardsToCreate.length;
                    await savedDeck.save();
                }

                createdDecks.push({ deck: savedDeck._id.toString(), order: deckData.order });
            }
        }

        const mooc = new Mooc({
            title: data.title,
            description: data.description,
            owner: data.owner,
            class: data.class || null,
            isPaid: data.isPaid || false,
            price: data.price || 0,
            currency: data.currency || 'VND',
            publicStatus: data.publicStatus ?? 0,
            isPublic: isMoocPublic,
            decks: createdDecks
        });

        const savedMooc = await mooc.save();
        if (!savedMooc) {
            return { success: false, message: 'Failed to create MOOC', data: null };
        }

        const populatedMooc = await savedMooc.populate('class');

        return {
            success: true,
            message: 'MOOC created successfully with decks, cards, and class info',
            data: {
                mooc: populatedMooc,
                classInfo
            }
        };
    } catch (error: any) {
        console.error('Error creating MOOC:', error);
        return {
            success: false,
            message: 'Error while creating MOOC',
            error: error.message,
            data: null
        };
    }
};

export const getAllMoocsService = async (classId: string) => {
    const moocs = await Mooc.find({ class: classId })
        .populate('owner', 'name email')
        .populate('decks.deck', 'title')
        .sort({ createdAt: -1 });

    return {
        success: true,
        message: 'MOOCs fetched successfully',
        data: moocs
    };
};

export const getMoocByIdService = async (id: string) => {
    const mooc = await Mooc.findById(id).populate('owner', 'name email').populate('decks.deck').lean();

    if (!mooc) return { success: false, message: 'MOOC not found', data: null };

    return {
        success: true,
        message: 'MOOC fetched successfully',
        data: mooc
    };
};
export const updateMoocService = async (moocId: string, data: any) => {
    const mooc: any = await Mooc.findById(moocId);
    if (!mooc) return null;

    if (data.title) mooc.title = data.title;
    if (data.description) mooc.description = data.description;

    if (data.publicStatus !== undefined) {
        mooc.publicStatus = data.publicStatus;

        // Nếu MOOC public, tự động set tất cả deck bên trong public
        if (data.publicStatus === 2 && Array.isArray(mooc.decks)) {
            for (const deckWrapper of mooc.decks) {
                if (deckWrapper.deck) {
                    const deck: any = await Deck.findById(deckWrapper.deck);
                    if (deck) {
                        deck.publicStatus = 2; // set deck public
                        await deck.save();
                    }
                }
            }
        }
    }

    if (data.isPaid !== undefined) mooc.isPaid = data.isPaid;
    if (data.price !== undefined) mooc.price = data.price;
    if (data.currency) mooc.currency = data.currency;

    if (data.class) {
        const classInfo: any = await Class.findById(data.class);
        if (classInfo) {
            mooc.class = classInfo._id as any;
        }
    }

    if (Array.isArray(data.decks)) {
        const updatedDecks: any[] = [];

        for (const deckData of data.decks) {
            let deck: any = null;

            if (deckData.deck) {
                deck = await Deck.findById(deckData.deck);
            }

            if (!deck) {
                deck = new Deck({
                    name: deckData.name || 'Untitled Deck',
                    description: deckData.description || '',
                    owner: mooc.owner,
                    publicStatus: mooc.publicStatus
                });
            } else {
                if (deckData.name) deck.name = deckData.name;
                if (deckData.description) deck.description = deckData.description;
                if (mooc.publicStatus === 2) deck.publicStatus = 2;
            }

            if (Array.isArray(deckData.cards)) {
                for (const cardData of deckData.cards) {
                    if (cardData._id) {
                        const card: any = await Card.findById(cardData._id);
                        if (card) {
                            if (cardData.front) card.front = cardData.front;
                            if (cardData.back) card.back = cardData.back;
                            if (cardData.image) card.image = cardData.image;
                            await card.save();
                        }
                    } else {
                        const newCard = new Card({
                            front: cardData.front,
                            back: cardData.back,
                            image: cardData.image,
                            deck: deck._id
                        });
                        await newCard.save();
                    }
                }
            }

            await deck.save();

            updatedDecks.push({
                deck: deck._id,
                order: deckData.order ?? 0
            });
        }

        mooc.decks = [...updatedDecks] as any;
    }

    mooc.updatedAt = new Date();
    await mooc.save();

    return mooc;
};

export const deleteMoocService = async (moocId: string, userId: string) => {
    const mooc = await Mooc.findById(moocId);
    if (!mooc) {
        return { success: false, message: 'MOOC không tồn tại', data: null };
    }

    if (mooc.owner.toString() !== userId) {
        return {
            success: false,
            message: 'Bạn không có quyền xóa MOOC này',
            data: null
        };
    }
    const deckIds = mooc.decks.map((d: any) => d.deck);

    if (deckIds.length > 0) {
        await Card.deleteMany({ deck: { $in: deckIds } });
        await Deck.deleteMany({ _id: { $in: deckIds } });
    }
    await Mooc.findByIdAndDelete(moocId);

    return {
        success: true,
        message: 'MOOC deleted successfully',
        data: mooc
    };
};

export const enrollUserService = async (moocId: string, userId: string) => {
    const mooc = await Mooc.findById(moocId).populate('class', 'users');
    if (!mooc) return { success: false, message: 'MOOC not found', data: null };
    const classObj = mooc.class as { users: Types.ObjectId[] } | null;
    if (classObj) {
        const isMember = classObj.users.some((u) => u.toString() === userId);
        if (!isMember) return { success: false, message: 'User is not a member of this class', data: null };
    }

    const alreadyEnrolled = mooc.enrolledUsers.some((u: any) => u.user.toString() === userId);
    if (alreadyEnrolled) return { success: true, message: 'User already enrolled', data: mooc };

    mooc.enrolledUsers.push({
        user: new Types.ObjectId(userId),
        currentDeckIndex: 0,
        progressState: 0,
        startedAt: new Date()
    });

    const saved = await mooc.save();
    return { success: true, message: 'User enrolled successfully', data: saved };
};

export const updateProgressService = async (moocId: string, userId: string, deckId: string, completed: boolean) => {
    const mooc = await Mooc.findById(moocId);
    if (!mooc) return { success: false, message: 'MOOC not found', data: null };

    const enrolled = mooc.enrolledUsers.find((u: any) => u.user.toString() === userId);
    if (!enrolled) return { success: false, message: 'User not enrolled in this MOOC', data: null };

    const deckProgress = enrolled.deckProgress.find((d: any) => d.deck.toString() === deckId);

    if (deckProgress) {
        deckProgress.completed = completed;
        deckProgress.completedAt = completed ? new Date() : undefined;
    } else {
        enrolled.deckProgress.push({
            deck: new Types.ObjectId(deckId),
            completed,
            completedAt: completed ? new Date() : undefined
        });
    }

    const allCompleted = enrolled.deckProgress.every((d: any) => d.completed);
    if (allCompleted) {
        enrolled.progressState = 2;
        enrolled.completedAt = new Date();
    } else {
        enrolled.progressState = 1;
    }

    const saved = await mooc.save();
    return { success: true, message: 'Progress updated successfully', data: saved };
};
