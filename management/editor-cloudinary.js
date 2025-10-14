// editor-cloudinary.js
// Cloudinary integration for Editor.js Image tool

console.log('Loading editor-cloudinary.js...');

/**
 * Upload image to Cloudinary for Editor.js SimpleImage tool
 * @param {File} file - Image file to upload
 * @returns {Promise<object>} Upload result with URL
 */
async function uploadImageToCloudinary(file) {
    console.log('Uploading image to Cloudinary via Editor.js...', file.name);
    
    const CLOUDINARY_CLOUD_NAME = 'dkzypkiwf';
    const CLOUDINARY_UPLOAD_PRESET = 'portfolio_uploads';
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
    
    try {
        const response = await fetch(
            `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
            {
                method: 'POST',
                body: formData
            }
        );
        
        if (!response.ok) {
            throw new Error('Upload failed');
        }
        
        const data = await response.json();
        console.log('Image uploaded successfully:', data.secure_url);
        
        // Return format for SimpleImage
        return {
            success: 1,
            file: {
                url: data.secure_url
            }
        };
    } catch (error) {
        console.error('Error uploading to Cloudinary:', error);
        return {
            success: 0
        };
    }
}

// Expose globally for editor-tools.js
window.uploadImageToCloudinary = uploadImageToCloudinary;

console.log('editor-cloudinary.js loaded successfully');