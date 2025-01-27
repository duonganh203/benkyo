export interface User {
    _id: string;
    username: string;
    email: string;
}

export interface AuthState {
    user: User | null;
    token: string | null;
}

export interface LoginPayload {
    email: string;
    password: string;
}

export interface RegisterPayload extends LoginPayload {
    username: string;
}
