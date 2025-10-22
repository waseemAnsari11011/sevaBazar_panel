import axiosInstance from '../../utils/axiosConfig' // Corrected: Use the centralized axios instance

/**
 * Adds a new variation to an existing product.
 * @param {string} productId - The ID of the product to add the variation to.
 * @param {object} variationData - The variation data, including attributes and images.
 * @returns {Promise<object>} The server response.
 */
const addVariationApi = async (productId, variationData) => {
  // FormData handles multipart/form-data for file uploads
  const formData = new FormData()

  // Append text fields. Attributes must be stringified as expected by the backend.
  formData.append('attributes', JSON.stringify(variationData.attributes))
  formData.append('price', variationData.price)
  formData.append('discount', variationData.discount || 0)
  formData.append('quantity', variationData.quantity || 0)

  // Append new image files. The backend expects 'newImages'.
  if (variationData.images && variationData.images.length > 0) {
    variationData.images.forEach((image) => {
      // Only append if it's a File object (a new upload)
      if (image instanceof File) {
        formData.append('newImages', image)
      }
    })
  }

  try {
    // Use axiosInstance, which has the base URL and auth headers pre-configured.
    const response = await axiosInstance.post(`/products/${productId}/variations`, formData, {
      headers: {
        // The Content-Type is still needed here to specify multipart
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  } catch (error) {
    console.error('Failed to add variation:', error)
    // Re-throw for the component to handle
    throw error.response ? error.response.data : new Error('An unknown error occurred')
  }
}

export default addVariationApi
