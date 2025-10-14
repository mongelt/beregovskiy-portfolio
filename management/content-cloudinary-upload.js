// content-cloudinary-upload.js
// Handles Cloudinary upload widget integration for images, videos, and audio

// Cloudinary configuration
const CLOUDINARY_CLOUD_NAME = 'dkzypkiwf';
const CLOUDINARY_UPLOAD_PRESET = 'portfolio_uploads';

/**
 * Create Cloudinary upload widget with custom styling
 * @param {string} resourceType - 'image', 'video', or 'raw' (for audio)
 * @param {function} onSuccess - Callback when upload succeeds
 * @returns {object} Cloudinary widget instance
 */
function createUploadWidget(resourceType, onSuccess) {
    const widget = cloudinary.createUploadWidget(
        {
            cloudName: CLOUDINARY_CLOUD_NAME,
            uploadPreset: CLOUDINARY_UPLOAD_PRESET,
            resourceType: resourceType,
            sources: ['local', 'url', 'camera'],
            multiple: false,
            maxFileSize: 10000000, // 10MB limit on free tier
            clientAllowedFormats: resourceType === 'image' ? ['jpg', 'jpeg', 'png', 'gif', 'webp'] : 
                                 resourceType === 'video' ? ['mp4', 'mov', 'avi', 'webm'] :
                                 ['mp3', 'wav', 'ogg'], // For 'raw' type (audio)
            styles: {
                palette: {
                    window: "#0D1123",
                    windowBorder: "#3B82F6",
                    tabIcon: "#60A5FA",
                    menuIcons: "#60A5FA",
                    textDark: "#FFFFFF",
                    textLight: "#FFFFFF",
                    link: "#3B82F6",
                    action: "#3B82F6",
                    inactiveTabIcon: "#6B7280",
                    error: "#EF4444",
                    inProgress: "#3B82F6",
                    complete: "#10B981",
                    sourceBg: "#1F2937"
                }
            }
        },
        (error, result) => {
            if (!error && result && result.event === "success") {
                console.log('Upload successful!', result.info);
                onSuccess(result.info.secure_url);
            } else if (error) {
                console.error('Upload error:', error);
            }
        }
    );
    return widget;
}

/**
 * Initialize all upload button event handlers
 */
function initializeUploadHandlers() {
    // Image upload button
    document.getElementById('uploadImageBtn').addEventListener('click', handleImageUpload);
    
    // Video upload button
    document.getElementById('uploadVideoBtn').addEventListener('click', handleVideoUpload);
    
    // Audio upload button
    document.getElementById('uploadAudioBtn').addEventListener('click', handleAudioUpload);
}

/**
 * Handle image upload button click
 */
function handleImageUpload() {
    const statusEl = document.getElementById('imageUploadStatus');
    statusEl.textContent = 'Opening upload widget...';
    statusEl.className = 'upload-status';
    
    const widget = createUploadWidget('image', (url) => {
        document.getElementById('imageUrl').value = url;
        statusEl.textContent = '✓ Image uploaded successfully!';
        statusEl.className = 'upload-status success';
    });
    
    widget.open();
}

/**
 * Handle video upload button click
 */
function handleVideoUpload() {
    const statusEl = document.getElementById('videoUploadStatus');
    statusEl.textContent = 'Opening upload widget...';
    statusEl.className = 'upload-status';
    
    const widget = createUploadWidget('video', (url) => {
        document.getElementById('videoUrl').value = url;
        statusEl.textContent = '✓ Video uploaded successfully!';
        statusEl.className = 'upload-status success';
    });
    
    widget.open();
}

/**
 * Handle audio upload button click
 */
function handleAudioUpload() {
    const statusEl = document.getElementById('audioUploadStatus');
    statusEl.textContent = 'Opening upload widget...';
    statusEl.className = 'upload-status';
    
    const widget = createUploadWidget('raw', (url) => {
        document.getElementById('audioUrl').value = url;
        statusEl.textContent = '✓ Audio uploaded successfully!';
        statusEl.className = 'upload-status success';
    });
    
    widget.open();
}

// Expose initialization function globally
window.initializeUploadHandlers = initializeUploadHandlers;