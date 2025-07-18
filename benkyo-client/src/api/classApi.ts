import {
    ClassJoinResponseDto,
    ClassListItemUserResponseDto,
    ClassUserRequestDto,
    ClassUserResponseDto
} from '@/types/class';
import { api } from '.';

export const createClassApi = async (data: ClassUserRequestDto) => {
    const response = await api.post('/class/create', data);
    return response.data as ClassUserResponseDto;
};

export const updateClassApi = async (_id: string, data: ClassUserRequestDto) => {
    const response = await api.put(`/class/${_id}/update`, data);
    return response.data as ClassUserResponseDto;
};

export const deleteClassApi = async (_id: string) => {
    const response = await api.put(`/class/${_id}/delete`);
    return response.data as { message: string };
};

export const getClassUpdateByIdApi = async (_id: string) => {
    const response = await api.get(`/class/${_id}/update-by-id`);
    return response.data as ClassUserResponseDto;
};

export const getClassListUserApi = async () => {
    const response = await api.get(`/class/list`);
    return response.data as ClassUserResponseDto[];
};

export const getMyClassApi = async (page: number = 1) => {
    const response = await api.get(`/class/my-class?page=${page}`);
    return response.data as {
        data: ClassListItemUserResponseDto[];
        hasMore: boolean;
    };
};

export const getSuggestedClassApi = async (page: number = 1) => {
    const response = await api.get(`/class/suggested?page=${page}`);
    return response.data as {
        data: ClassListItemUserResponseDto[];
        hasMore: boolean;
    };
};

export const requestJoinClassApi = async (classId: string) => {
    const response = await api.post(`/class/${classId}/request`);
    return response.data as ClassJoinResponseDto;
};

export const rejectJoinClassApi = async (classId: string, userId: string) => {
    const response = await api.get(`/class/reject?classId=${classId}&userId=${userId}`);
    return response.data as ClassJoinResponseDto;
};
