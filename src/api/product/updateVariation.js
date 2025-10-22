import axiosInstance from '../../utils/axiosConfig'

const updateVariation = async (productId, variationId, variationData) => {
  const formData = new FormData()

  // Append variation details
  formData.append('price', variationData.price)
  formData.append('discount', variationData.discount)
  formData.append('quantity', variationData.quantity)
  formData.append('attributes', JSON.stringify(variationData.attributes))

  // Separate existing image URLs from new image files
  const existingImages = []
  variationData.images.forEach((image) => {
    if (typeof image === 'string') {
      existingImages.push(image)
    } else {
      formData.append('newImages', image)
    }
  })

  formData.append('existingImages', JSON.stringify(existingImages))

  try {
    const response = await axiosInstance.put(
      `/products/${productId}/variations/${variationId}`,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } },
    )
    return response.data
  } catch (error) {
    console.error(`Failed to update variation ${variationId}:`, error)
    throw error
  }
}

export default updateVariation
