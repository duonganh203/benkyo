export interface User {
    _id: string;
    username: string;
    email: string;
    avatar: string;
    isPro: boolean;
    proType: string;
    fsrsParams?: {
        request_retention: number;
        maximum_interval: number;
        w: number[];
        enable_fuzz: boolean;
        enable_short_term: boolean;
        card_limit: number;
        lapses: number;
    };
}

export interface AuthState {
    user: User | null;
    token: string | null;
    refreshToken: string | null;
}

export interface LoginPayload {
    email: string;
    password: string;
}

export interface RegisterPayload extends LoginPayload {
    name: string;
}
