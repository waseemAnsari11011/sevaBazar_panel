import imageCompression from 'browser-image-compression'

/**
 * Compresses an image file to keep it under the maximum size limit.
 * Non-image files or files already under the limit are returned as is.
 * * @param {File} file The file object to potentially compress.
 * @returns {Promise<File>} The compressed file object or the original file.
 */
export const compressImageFile = async (file) => {
  // Check if the file is an image and if it exceeds the target size (e.g., 4.5MB)
  const MAX_SIZE_MB = 4.5
  const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024

  if (!file.type.startsWith('image/') || file.size <= MAX_SIZE_BYTES) {
    // Return non-image files or small images immediately
    return file
  }

  console.log(`Original file size: ${(file.size / 1024 / 1024).toFixed(2)} MB`)

  // Compression options
  const options = {
    maxSizeMB: MAX_SIZE_MB, // Max size of the compressed file in MB
    maxWidthOrHeight: 1920, // Max width or height in pixels
    useWebWorker: true, // Use web worker for better performance (recommended)
    fileType: 'image/jpeg', // Convert to JPEG for better compression rates
    initialQuality: 0.9,
  }

  try {
    const compressedBlob = await imageCompression(file, options)

    // Convert the compressed Blob back to a File object with the original name
    const compressedFile = new File([compressedBlob], file.name, {
      type: 'image/jpeg', // Use JPEG type from compression options
      lastModified: Date.now(),
    })

    console.log(`Compressed file size: ${(compressedFile.size / 1024 / 1024).toFixed(2)} MB`)
    return compressedFile
  } catch (error) {
    console.error('Image compression failed, using original file:', error)
    return file // Fallback to the original file if compression fails
  }
}
