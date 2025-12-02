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
    publicStatus?: number;
    locked?: boolean;
    decks?: {
        name: string;
        description?: string;
        order: number;
        locked?: boolean;
        cards?: { front: string; back: string; tags?: string[] }[];
    }[];
}) => {
    try {
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

        // Xác định MOOC sẽ bị lock hay không
        let moocLocked = false;
        if (data.locked || data.isPaid) {
            moocLocked = true; // override nếu chủ muốn hoặc MOOC trả phí
        } else if (data.class) {
            // Lấy MOOC đã có trong class
            const moocsInClass = await Mooc.find({ class: data.class }).sort({ createdAt: 1 });
            moocLocked = moocsInClass.length > 0; // MOOC đầu tiên mở, các MOOC sau lock
        }

        const isMoocPublic = data.publicStatus === 2;

        // Tạo các deck
        const createdDecks: { deck: string; order: number }[] = [];
        if (data.decks && data.decks.length > 0) {
            for (const deckData of data.decks) {
                const isFirstDeck = deckData.order === 0;
                const deckLocked = moocLocked ? true : !isFirstDeck;
                const deck = new Deck({
                    name: deckData.name,
                    description: deckData.description,
                    owner: data.owner,
                    publicStatus: isMoocPublic ? 2 : 0,
                    isPublic: isMoocPublic,
                    locked: deckLocked
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

        // Tạo MOOC
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
            decks: createdDecks,
            locked: moocLocked
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
        .populate('decks.deck')
        .sort({ createdAt: 1 });

    if (moocs.length > 0) {
        moocs[0].locked = false;
    }

    return {
        success: true,
        message: 'MOOCs fetched successfully',
        data: moocs
    };
};

export const getMoocByIdService = async (id: string, userId?: string) => {
    const mooc: any = await Mooc.findById(id)
        .populate('owner', 'name email')
        .populate('decks.deck', 'name description cardCount locked publicStatus')
        .lean();

    if (!mooc) return { success: false, message: 'MOOC not found', data: null };

    const decksWithLocked = mooc.decks.map((deckWrapper: any) => ({
        ...deckWrapper,
        deck: {
            ...deckWrapper.deck
        }
    }));

    return {
        success: true,
        message: 'MOOC fetched successfully',
        data: {
            ...mooc,
            decks: decksWithLocked
        }
    };
};

export const updateMoocService = async (moocId: string, data: any) => {
    const mooc: any = await Mooc.findById(moocId);
    if (!mooc) return null;

    if (data.title) mooc.title = data.title;
    if (data.description) mooc.description = data.description;
    if (data.currency) mooc.currency = data.currency;
    if (data.price !== undefined) mooc.price = data.price;
    if (data.isPaid !== undefined) mooc.isPaid = data.isPaid;

    if (data.publicStatus !== undefined) {
        mooc.publicStatus = data.publicStatus;
        if (data.publicStatus === 2 && Array.isArray(mooc.decks)) {
            for (const deckWrapper of mooc.decks) {
                if (deckWrapper.deck) {
                    const deck: any = await Deck.findById(deckWrapper.deck);
                    if (deck) {
                        deck.publicStatus = 2;
                        await deck.save();
                    }
                }
            }
        }
    }

    if (data.class) {
        const classInfo: any = await Class.findById(data.class);
        if (classInfo) {
            mooc.class = classInfo._id;
        }
    }

    let moocLocked = false;
    if (data.locked || mooc.isPaid) {
        moocLocked = true;
    } else if (mooc.class) {
        const moocsInClass = await Mooc.find({ class: mooc.class, _id: { $ne: mooc._id } }).sort({ createdAt: 1 });
        moocLocked = moocsInClass.length > 0;
    }
    mooc.locked = moocLocked;

    if (Array.isArray(data.decks)) {
        const updatedDecks: any[] = [];
        let minOrder = Number.POSITIVE_INFINITY;
        let minOrderDeckId: any = null;
        const deckIdToInstance: Record<string, any> = {};

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

            const deckOrder = deckData.order ?? 0;

            deck.locked = mooc.locked ? true : deckOrder > 0;

            if (deckOrder < minOrder) {
                minOrder = deckOrder;
                minOrderDeckId = deck._id.toString();
            }
            deckIdToInstance[deck._id.toString()] = deck;

            if (Array.isArray(deckData.cards)) {
                let cardCount = 0;
                for (const cardData of deckData.cards) {
                    if (cardData._id) {
                        const card: any = await Card.findById(cardData._id);
                        if (card) {
                            if (cardData.front) card.front = cardData.front;
                            if (cardData.back) card.back = cardData.back;
                            if (cardData.image) card.image = cardData.image;
                            if (cardData.tags) card.tags = cardData.tags;
                            await card.save();
                            cardCount++;
                        }
                    } else {
                        const newCard = new Card({
                            front: cardData.front,
                            back: cardData.back,
                            image: cardData.image,
                            tags: cardData.tags || [],
                            deck: deck._id
                        });
                        await newCard.save();
                        cardCount++;
                    }
                }
                deck.cardCount = cardCount;
            }

            await deck.save();

            updatedDecks.push({
                deck: deck._id,
                order: deckOrder
            });
        }

        if (!mooc.locked && minOrderDeckId && deckIdToInstance[minOrderDeckId]) {
            deckIdToInstance[minOrderDeckId].locked = false;
            await deckIdToInstance[minOrderDeckId].save();
        }

        mooc.decks = [...updatedDecks];
    }

    mooc.updatedAt = new Date();
    await mooc.save();

    return mooc;
};

export const deleteMoocService = async (moocId: string, userId: string) => {
    const mooc = await Mooc.findById(moocId);
    if (!mooc) {
        return { success: false, message: 'MOOC does not exist', data: null };
    }

    if (mooc.owner.toString() !== userId) {
        return {
            success: false,
            message: 'You do not have permission to delete this MOOC',
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
    // Lấy MOOC và populate class
    const mooc = await Mooc.findById(moocId).populate('class', 'users');

    if (!mooc) {
        return { success: false, message: 'MOOC not found', data: null };
    }

    // Kiểm tra user có thuộc class không
    const classObj = mooc.class as { users: Types.ObjectId[] } | null;
    if (classObj) {
        const isMember = classObj.users.some((u) => u.toString() === userId);
        if (!isMember) {
            return { success: false, message: 'User is not a member of this class', data: null };
        }
    }

    // Kiểm tra user đã enroll chưa
    const alreadyEnrolled = mooc.enrolledUsers.some((u: any) => u.user.toString() === userId);
    if (alreadyEnrolled) return { success: true, message: 'User already enrolled', data: mooc };

    // Tạo deckProgress
    const deckProgress = mooc.decks.map((d) => ({
        deck: d.deck,
        progress: 0,
        completed: false,
        locked: d.order !== 0,
        completedAt: null
    }));

    // Thêm user vào enrolledUsers
    mooc.enrolledUsers.push({
        user: new Types.ObjectId(userId),
        currentDeckIndex: 0,
        progressState: 0,
        startedAt: new Date(),
        deckProgress
    });

    // Lưu MOOC
    const saved = await mooc.save();

    return { success: true, message: 'User enrolled successfully', data: saved };
};

export const updateProgressService = async (moocId: string, userId: string, deckId: string, completed: boolean) => {
    const mooc = await Mooc.findById(moocId).populate('class', 'users');
    if (!mooc) {
        return { success: false, message: 'MOOC not found', data: null };
    }

    const enrolled = mooc.enrolledUsers.find((u: any) => u.user.toString() === userId);
    if (!enrolled) {
        return { success: false, message: 'User not enrolled in this MOOC', data: null };
    }

    let deckProgress = enrolled.deckProgress.find((d: any) => d.deck.toString() === deckId);
    if (deckProgress) {
        deckProgress.completed = completed;
        deckProgress.completedAt = completed ? new Date() : undefined;
    } else {
        enrolled.deckProgress.push({
            deck: new Types.ObjectId(deckId),
            completed,
            completedAt: completed ? new Date() : undefined,
            locked: false
        });
        deckProgress = enrolled.deckProgress[enrolled.deckProgress.length - 1];
    }

    const allCompleted = enrolled.deckProgress.every((d: any) => d.completed);
    if (allCompleted) {
        enrolled.progressState = 2;
        enrolled.completedAt = new Date();
        let classId: string | null = null;
        if (mooc.class) {
            if (typeof mooc.class === 'string' || mooc.class instanceof Types.ObjectId) {
                classId = mooc.class.toString();
            } else {
                classId = (mooc.class as any)._id ? (mooc.class as any)._id.toString() : (mooc.class as any).toString();
            }
        }
        if (!classId) {
            const parentClass = await Class.findOne({ moocs: moocId });
            if (parentClass) {
                classId = parentClass._id.toString();
            }
        }

        if (classId) {
            await unlockNextMoocForUser(mooc, userId);
        }
    } else {
        enrolled.progressState = 1;
    }
    const saved = await mooc.save();

    return { success: true, message: 'Progress updated successfully', data: saved };
};

export const unlockNextMoocForUser = async (mooc: any, userId: string) => {
    if (!mooc || !mooc.class) return;
    const moocsInClass = await Mooc.find({ class: mooc.class }).sort({ createdAt: 1 });

    if (!moocsInClass || moocsInClass.length === 0) return;
    const currentIndex = moocsInClass.findIndex((m) => m._id.toString() === mooc._id.toString());
    if (currentIndex < 0 || currentIndex === moocsInClass.length - 1) return;
    const nextMooc = moocsInClass[currentIndex + 1];
    if (!nextMooc) return;

    const nextMoocDoc = await Mooc.findById(nextMooc._id);
    if (!nextMoocDoc) return;
    const enrolled = nextMoocDoc.enrolledUsers.find((en: any) => en.user.toString() === userId);
    if (!enrolled) {
        if (!nextMoocDoc.isPaid) {
            nextMoocDoc.enrolledUsers.push({
                user: new Types.ObjectId(userId),
                currentDeckIndex: 0,
                progressState: 0,
                startedAt: new Date(),
                deckProgress: nextMoocDoc.decks.map((d: any) => ({
                    deck: d.deck,
                    progress: 0,
                    completed: false,
                    locked: false,
                    completedAt: null
                }))
            });
        } else {
            return;
        }
    } else {
        enrolled.deckProgress.forEach((d: any) => (d.locked = false));
    }

    await nextMoocDoc.save();
};

export const updateDeckProgressForUserService = async (
    moocId: string,
    userId: string,
    deckId: string,
    lastSeenIndex: number,
    totalCards: number
) => {
    const mooc = await Mooc.findById(moocId);
    if (!mooc) return { success: false, message: 'MOOC not found' };

    const enrolled = mooc.enrolledUsers.find((u: any) => u.user.toString() === userId.toString());
    if (!enrolled) return { success: false, message: 'User not enrolled in this MOOC' };

    const deckProgressIndex = enrolled.deckProgress.findIndex((d: any) => d.deck.toString() === deckId.toString());

    let deckProgress;
    const progressPercent = totalCards > 0 ? Math.floor(((lastSeenIndex + 1) / totalCards) * 100) : 0;

    if (deckProgressIndex === -1) {
        // Tạo mới subdocument
        deckProgress = enrolled.deckProgress.create({
            deck: new Types.ObjectId(deckId),
            lastSeenIndex,
            progress: progressPercent,
            completed: false,
            locked: false,
            completedAt: null
        });
        enrolled.deckProgress.push(deckProgress);
    } else {
        deckProgress = enrolled.deckProgress[deckProgressIndex];
        deckProgress.lastSeenIndex = lastSeenIndex;
        deckProgress.progress = progressPercent;

        // ⚡ bắt buộc markModified để Mongoose nhận ra đã thay đổi
        enrolled.markModified(`deckProgress.${deckProgressIndex}`);
    }

    await mooc.save();

    return {
        success: true,
        message: 'Deck progress updated',
        data: {
            deck: deckProgress.deck,
            lastSeenIndex: deckProgress.lastSeenIndex,
            progress: deckProgress.progress
        }
    };
};
