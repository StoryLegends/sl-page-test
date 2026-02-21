import apiClient from './client';
import type { User, UpdateProfileData, Badge } from './users';

export interface BadgeCreateData {
    name: string;
    color: string;
    svgIcon: string;
    discordRoleId: string;
}

export const adminApi = {
    // Users
    getAllUsers: async (): Promise<User[]> => {
        const response = await apiClient.get('/api/admin/users');
        return response.data;
    },

    createUser: async (data: any): Promise<User> => {
        const response = await apiClient.post('/api/admin/users', data);
        return response.data;
    },

    updateUser: async (id: number, data: UpdateProfileData): Promise<User> => {
        const response = await apiClient.patch(`/api/admin/users/${id}`, data);
        return response.data;
    },

    deleteUser: async (id: number): Promise<void> => {
        await apiClient.delete(`/api/admin/users/${id}`);
    },

    banUser: async (id: number, reason: string): Promise<User> => {
        const response = await apiClient.post(`/api/admin/users/${id}/ban`, { reason });
        return response.data;
    },

    unbanUser: async (id: number): Promise<User> => {
        const response = await apiClient.post(`/api/admin/users/${id}/unban`);
        return response.data;
    },

    resetUserPassword: async (id: number): Promise<{ temporaryPassword: string }> => {
        const response = await apiClient.post(`/api/admin/users/${id}/reset-password`);
        return response.data;
    },

    // Badges
    getBadges: async (): Promise<Badge[]> => {
        const response = await apiClient.get('/api/admin/badges');
        return response.data;
    },

    createBadge: async (data: BadgeCreateData): Promise<Badge> => {
        const response = await apiClient.post('/api/admin/badges', data);
        return response.data;
    },

    updateBadge: async (id: number, data: Partial<BadgeCreateData>): Promise<Badge> => {
        const response = await apiClient.patch(`/api/admin/badges/${id}`, data);
        return response.data;
    },

    deleteBadge: async (id: number): Promise<void> => {
        await apiClient.delete(`/api/admin/badges/${id}`);
    },

    assignBadge: async (userId: number, badgeId: number): Promise<void> => {
        await apiClient.post(`/api/admin/users/${userId}/badges/${badgeId}`);
    },

    removeBadge: async (userId: number, badgeId: number): Promise<void> => {
        await apiClient.delete(`/api/admin/users/${userId}/badges/${badgeId}`);
    },
};

