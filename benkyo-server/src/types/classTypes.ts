import { Types } from 'mongoose';

export type VisitHistoryEntry = {
    userId: Types.ObjectId;
    lastVisit: Date;
};

export type ClassDeckRef = {
    deck: {
        _id: Types.ObjectId;
        name: string;
        cardCount: number;
        avgRating?: number;
    };
    description?: string;
    startTime?: Date;
    endTime?: Date;
};

export type PopulatedUser = {
    _id: Types.ObjectId;
    name: string;
    email: string;
};

export type ClassProgressData = {
    correctCount: number;
    totalCount: number;
};

export type ClassDeckProgress = ClassProgressData & {
    _id: string;
    name: string;
    cardCount: number;
    avgRating: number;
    description: string;
    startTime?: Date;
    endTime?: Date;
    totalCount: number;
    correctCount: number;
};

export type ClassUserStateData = {
    _id: string;
    user: {
        _id: string;
        name: string;
        avatar: string;
    };
    points: number;
    studyStreak: number;
    completedCardIds: string[];
};

export type GetClassUserByIdResponse = {
    _id: string;
    name: string;
    description: string;
    users: Array<{
        _id: string;
        name: string;
        email: string;
    }>;
    decks: ClassDeckProgress[];
    owner: {
        _id: string;
        name: string;
    };
    visibility: 'public' | 'private';
    requiredApprovalToJoin: boolean;
    createdAt: Date;
    userClassStates: ClassUserStateData[];
    completionRate: number;
    bannerUrl: string;
    visited: {
        history: string[];
    };
};

export type PopulatedDeck = {
    _id: Types.ObjectId;
    cardCount: number;
};

export type MongooseDeckRef = {
    deck:
        | Types.ObjectId
        | {
              _id: Types.ObjectId;
              name: string;
              cardCount: number;
              avgRating?: number;
          };
    description?: string | null;
    startTime?: Date;
    endTime?: Date;
};

export type MongooseUserRef = {
    _id: Types.ObjectId;
    name: string;
    email: string;
};

export type MongooseOwnerRef = {
    _id: Types.ObjectId;
    name: string;
};

export type MongooseUserClassState = {
    _id: Types.ObjectId;
    user: {
        _id: Types.ObjectId;
        name: string;
        email: string;
    };
    points: number;
    studyStreak: number;
    completedCardIds: Types.ObjectId[];
};

export type MongooseVisitEntry = {
    userId: Types.ObjectId;
    lastVisit: Date;
};

export type MongooseClass = {
    _id: Types.ObjectId;
    name: string;
    description: string;
    owner: Types.ObjectId | MongooseOwnerRef;
    users: Types.ObjectId[] | MongooseUserRef[];
    decks: MongooseDeckRef[];
    bannerUrl: string;
    requiredApprovalToJoin: boolean;
    userClassStates: MongooseUserClassState[];
    createdAt: Date;
    visibility: 'public' | 'private';
    visited?: {
        history: MongooseVisitEntry[];
    };
};
