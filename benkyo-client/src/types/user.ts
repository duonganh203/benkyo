export interface updateUserPayload {
    name?: string;
    avatar?: string;
}

export interface User {
    _id: string;
    name: string;
    avatar: string;
    stats: {
        longestStudyStreak?: number;
    };
}
