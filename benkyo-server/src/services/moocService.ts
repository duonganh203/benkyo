import { Mooc, Class } from '~/schemas';
import { Types } from 'mongoose';

export const createMoocService = async (data: {
    title: string;
    description?: string;
    owner: string;
    class?: string;
    decks?: { deck: string; order: number }[];
    isPaid?: boolean;
    price?: number;
    currency?: string;
}) => {
    const mooc = new Mooc(data);
    const saved = await mooc.save();
    if (!saved) return { success: false, message: 'Failed to create MOOC', data: null };
    return { success: true, message: 'MOOC created successfully', data: saved };
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

export const updateMoocService = async (id: string, data: Partial<any>) => {
    const updated = await Mooc.findByIdAndUpdate(id, data, { new: true });
    if (!updated) return { success: false, message: 'MOOC not found', data: null };
    return { success: true, message: 'MOOC updated successfully', data: updated };
};

export const deleteMoocService = async (id: string) => {
    const deleted = await Mooc.findByIdAndDelete(id);
    if (!deleted) return { success: false, message: 'MOOC not found', data: null };
    return { success: true, message: 'MOOC deleted successfully', data: deleted };
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
