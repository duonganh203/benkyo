import { Types } from 'mongoose';

export interface VisitHistoryEntry {
    userId: Types.ObjectId;
    lastVisit: Date;
}

export interface ClassDeckRef {
    deck: {
        _id: Types.ObjectId;
        name: string;
        cardCount: number;
        avgRating?: number;
    };
    description?: string;
    startTime?: Date;
    endTime?: Date;
}

export interface PopulatedUser {
    _id: Types.ObjectId;
    name: string;
    email: string;
}

export interface ClassProgressData {
    correctCount: number;
    totalCount: number;
}

export interface ClassDeckProgress extends ClassProgressData {
    _id: string;
    name: string;
    cardCount: number;
    avgRating: number;
    description: string;
    startTime?: Date;
    endTime?: Date;
    totalCount: number;
    correctCount: number;
}

export interface ClassUserStateData {
    _id: string;
    user: {
        _id: string;
        name: string;
        avatar: string;
    };
    points: number;
    studyStreak: number;
    completedCardIds: string[];
}

export interface GetClassUserByIdResponse {
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
}

export interface MongooseDeckRef {
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
}

export interface MongooseUserRef {
    _id: Types.ObjectId;
    name: string;
    email: string;
}

export interface MongooseOwnerRef {
    _id: Types.ObjectId;
    name: string;
}

export interface MongooseUserClassState {
    _id: Types.ObjectId;
    user: {
        _id: Types.ObjectId;
        name: string;
        email: string;
    };
    points: number;
    studyStreak: number;
    completedCardIds: Types.ObjectId[];
}

export interface MongooseVisitEntry {
    userId: Types.ObjectId;
    lastVisit: Date;
}

export interface MongooseClass {
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
}
