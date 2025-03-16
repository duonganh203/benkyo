const cloudName = import.meta.env.CLOUDINARY_CLOUD_NAME;
const cloudinaryConfig = {
    cloudName: cloudName,
    uploadPreset: 'benkyo-avatar',
    apiBase: `https://api.cloudinary.com/v1_1/`
};

export default cloudinaryConfig;
