import axiosInstance from '../../utils/axiosConfig'

const createProduct = async (productData) => {
  const formData = new FormData()

  // ADDED: Append core product details
  formData.append('name', productData.name)
  formData.append('description', productData.description)
  formData.append('category', productData.category)
  formData.append('vendor', productData.vendor)
  formData.append('isReturnAllowed', productData.isReturnAllowed)
  formData.append('isVisible', productData.isVisible) // ADDED
  formData.append('arrivalDuration', productData.arrivalDuration || '') // ADDED

  productData.tags?.forEach((tag) => {
    formData.append('tags', tag)
  })

  // REFACTORED: Variation handling remains, but is now the only source of images
  const variationsForJson = []
  productData.variations?.forEach((variation, variationIndex) => {
    const { images, ...variationWithoutImages } = variation
    variationsForJson.push(variationWithoutImages)

    images?.forEach((image, imageIndex) => {
      // New images are File objects
      if (image instanceof File) {
        formData.append(`variationImage_${variationIndex}_${imageIndex}`, image)
      }
    })
  })

  formData.append('variations', JSON.stringify(variationsForJson))

  try {
    const response = await axiosInstance.post('/products', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return response.data
  } catch (error) {
    console.error('Failed to create product:', error)
    throw error
  }
}

export default createProduct
