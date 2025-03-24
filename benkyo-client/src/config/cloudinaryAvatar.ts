const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const avatarUploadPreset = import.meta.env.VITE_UPLOAD_PRESET_AVATAR;
const cloudinaryConfig = {
    cloudName: cloudName,
    uploadPreset: avatarUploadPreset,
    apiBase: `https://api.cloudinary.com/v1_1/`
};

export default cloudinaryConfig;
