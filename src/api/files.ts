import apiClient from './client';

export const filesApi = {
    // Upload avatar
    uploadAvatar: async (file: File): Promise<{ url: string }> => {
        const formData = new FormData();
        formData.append('file', file);

        const response = await apiClient.post('/api/files/upload/avatar', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });

        return response.data;
    },

    // Delete avatar
    deleteAvatar: async (): Promise<void> => {
        await apiClient.delete('/api/files/avatar');
    },

    // Upload application image
    uploadApplicationImage: async (file: File): Promise<{ url: string }> => {
        const formData = new FormData();
        formData.append('file', file);

        const response = await apiClient.post('/api/files/upload/application-image', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });

        return response.data;
    },
};
