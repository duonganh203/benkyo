import { api } from '.';
import {
    CreateMoocPayload,
    UpdateMoocPayload,
    EnrollPayload,
    UpdateProgressPayload,
    MoocInterface
} from '@/types/mooc';

export const createMooc = async (payload: CreateMoocPayload) => {
    const { data } = await api.post('/moocs', payload);
    return data as {
        success: boolean;
        message: string;
        data: MoocInterface;
    };
};

export const getAllMoocs = async (classId?: string) => {
    const endpoint = classId ? `/moocs/class/${classId}` : '/moocs';
    const { data } = await api.get(endpoint);
    return data;
};

export const getMoocById = async (moocId: string) => {
    const { data } = await api.get(`/moocs/${moocId}`);
    return data as {
        success: boolean;
        message: string;
        data: MoocInterface;
    };
};

export const updateMooc = async (moocId: string, payload: UpdateMoocPayload) => {
    const { data } = await api.put(`/moocs/${moocId}`, payload);
    return data as {
        success: boolean;
        message: string;
        data: MoocInterface;
    };
};

export const deleteMooc = async (moocId: string) => {
    const { data } = await api.delete(`/moocs/${moocId}`);
    return data as {
        success: boolean;
        message: string;
    };
};

export const enrollUser = async (moocId: string, payload: EnrollPayload) => {
    const { data } = await api.post(`/moocs/${moocId}/enroll`, payload);
    return data as {
        success: boolean;
        message: string;
        data?: MoocInterface;
    };
};

export const updateMoocProgress = async (moocId: string, payload: UpdateProgressPayload) => {
    const { data } = await api.put(`/moocs/${moocId}/progress`, payload);
    return data as {
        success: boolean;
        message: string;
        data?: MoocInterface;
    };
};
