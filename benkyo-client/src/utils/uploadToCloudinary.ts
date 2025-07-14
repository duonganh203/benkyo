import axios from 'axios';
import { getToast } from './getToast';
import cloudinaryConfig from '@/config/cloudinaryAvatar';

const uploadToCloudinary = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', cloudinaryConfig.uploadPreset);

    try {
        const { data } = await axios.post(
            `${cloudinaryConfig.apiBase}${cloudinaryConfig.cloudName}/image/upload`,
            formData
        );
        return data.secure_url;
    } catch (error) {
        console.error('Upload failed:', error);
        getToast('error', 'Failed to upload image');
        return null;
    }
};
export default uploadToCloudinary;
