import apiClient from './client';
import type { User } from './users';

export interface Application {
    id: number;
    firstName: string;
    lastName: string;
    whyUs: string;
    source: string;
    makeContent: boolean;
    additionalInfo: string;
    selfRating: number;
    status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
    adminComment?: string | null;
    createdAt: string;
    user: User;
}

export interface ApplicationCreateData {
    firstName: string;
    lastName: string;
    whyUs: string;
    source: string;
    makeContent: boolean;
    additionalInfo: string;
    selfRating: number;
    recaptchaToken: string;
}

export const applicationsApi = {
    create: async (data: ApplicationCreateData): Promise<Application> => {
        const response = await apiClient.post('/api/applications', data);
        return response.data;
    },

    getMy: async (): Promise<Application[]> => {
        const response = await apiClient.get('/api/applications/my');
        return response.data;
    },

    getAll: async (status?: string): Promise<Application[]> => {
        const params = status ? { status } : {};
        const response = await apiClient.get('/api/admin/applications', { params });
        return response.data;
    },

    updateStatus: async (id: number, status: string, adminComment?: string): Promise<Application> => {
        const response = await apiClient.patch(`/api/admin/applications/${id}/status`, { status, adminComment });
        return response.data;
    },
};

