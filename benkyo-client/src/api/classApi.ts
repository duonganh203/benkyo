import {
    AddDeckToClassRequestDto,
    ClassJoinResponseDto,
    ClassListItemUserResponseDto,
    ClassManagementResponseDto,
    ClassUserRequestDto,
    ClassUserResponseDto,
    DeckToAddClassResponseDto,
    InviteMemberResponseDto,
    RemoveUserClassResponseDto
} from '@/types/class';
import { api } from '.';
import { ClassNotification } from '@/types/notification';
import { createQuizPayload, CreateQuizRes } from '@/types/quiz';

export const createClassApi = async (data: ClassUserRequestDto) => {
    const response = await api.post('/class/create', data);
    return response.data as ClassUserResponseDto;
};

export const updateClassApi = async (_id: string, data: ClassUserRequestDto) => {
    const response = await api.put(`/class/${_id}/update`, data);
    return response.data as ClassUserResponseDto;
};

export const deleteClassApi = async (_id: string) => {
    const response = await api.delete(`/class/${_id}/delete`);
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
    const response = await api.post(`/class/reject?classId=${classId}&userId=${userId}`);
    return response.data as ClassJoinResponseDto;
};

export const acceptJoinClassApi = async (classId: string, userId: string) => {
    const response = await api.post(`/class/accept?classId=${classId}&userId=${userId}`);
    return response.data as ClassJoinResponseDto;
};
export const getClassManagemenById = async (classId: string) => {
    const response = await api.get(`/class/${classId}/management`);
    return response.data as ClassManagementResponseDto;
};

export const inviteMemberToClassApi = async (classId: string, email: string) => {
    const response = await api.post(`/class/invite?classId=${classId}&email=${email}`);
    return response.data as InviteMemberResponseDto;
};

export const acceptInviteClassApi = async (classId: string) => {
    const response = await api.post(`/class/accept-invite?classId=${classId}`);
    return response.data as { message: string };
};

export const rejectInviteClassApi = async (classId: string) => {
    const response = await api.post(`/class/reject-invite?classId=${classId}`);
    return response.data as { message: string };
};

export const getInviteClassApi = async () => {
    const response = await api.get(`/class/invited`);
    return response.data as ClassNotification[];
};

export const removeUserFromClassApi = async (classId: string, userId: string) => {
    const response = await api.delete(`/class/remove-user?classId=${classId}&userId=${userId}`);
    return response.data as RemoveUserClassResponseDto;
};

export const removeDeckFromClassApi = async (classId: string, deckId: string) => {
    const response = await api.delete(`/class/remove-deck?classId=${classId}&deckId=${deckId}`);
    return response.data as RemoveUserClassResponseDto;
};

export const addDeckToClassApi = async (data: AddDeckToClassRequestDto) => {
    const response = await api.post('/class/add-deck', data);
    return response.data as { message: string };
};

export const getDecksToAddToClassApi = async (classId: string) => {
    const response = await api.get(`/class/${classId}/decks-to-add`);
    return response.data as DeckToAddClassResponseDto[];
};

export const createClassQuizApi = async ({ classId, title, description, questions }: createQuizPayload) => {
    const response = await api.post(`/class/${classId}/management/quiz`, { title, description, questions });
    return response.data as CreateQuizRes;
};

export const getClassQuizApi = async (classId: string) => {
    const response = await api.get(`/class/${classId}/management/quiz`);
    return response.data as CreateQuizRes[];
};

export const updateClassQuizApi = async (classId: string, quizId: string, data: createQuizPayload) => {
    const response = await api.put(`/class/${classId}/management/quiz/${quizId}`, data);
    return response.data as CreateQuizRes;
};

export const deleteClassQuizApi = async (classId: string, quizId: string) => {
    const response = await api.delete(`/class/${classId}/management/quiz/${quizId}`);
    return response.data as { message: string };
};
