// src/api/product/updateProduct.js

import axiosInstance from '../../utils/axiosConfig'

const updateProduct = async (id, productData) => {
  const formData = new FormData()

  // Append basic product details
  formData.append('name', productData.name || '')
  formData.append('description', productData.description || '')
  formData.append('category', productData.category || '')
  formData.append('vendor', productData.vendor || '')
  formData.append('isReturnAllowed', productData.isReturnAllowed)

  // Append available localities
  productData.availableLocalities?.forEach((location) => {
    formData.append('availableLocalities', location)
  })

  // Append tags
  productData.tags?.forEach((tag) => {
    formData.append('tags', tag)
  })

  // ✅ CORRECTED PRODUCT IMAGE HANDLING
  // Handle main product images: separate existing URLs from new files
  let newProductImageIndex = 0 // Initialize a counter for new images
  if (productData.images) {
    productData.images.forEach((image) => {
      if (typeof image === 'string') {
        // Append existing image URLs to the 'existingImages' field
        formData.append('existingImages', image)
      } else {
        // Append new image files with dynamically numbered field names
        formData.append(`productImage_${newProductImageIndex}`, image)
        newProductImageIndex++ // Increment counter for the next new image
      }
    })
  }

  // Correctly handle variations
  const variations = productData.variations
  const variationsForJson = []

  if (variations) {
    variations.forEach((variation, variationIndex) => {
      const cleanVariation = { ...variation, images: [] }

      variation.images?.forEach((image, imageIndex) => {
        if (typeof image === 'string') {
          cleanVariation.images.push(image)
        } else {
          formData.append(`variationImage_${variationIndex}_${imageIndex}`, image)
        }
      })

      variationsForJson.push(cleanVariation)
    })
  }

  formData.append('variations', JSON.stringify(variationsForJson))

  try {
    const response = await axiosInstance.put(`/products/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return response.data
  } catch (error) {
    console.error('Failed to update product:', error)
    throw error
  }
}

export default updateProduct
