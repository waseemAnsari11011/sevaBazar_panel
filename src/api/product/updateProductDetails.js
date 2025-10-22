import axiosInstance from '../../utils/axiosConfig'

const updateProductDetails = async (id, productDetails) => {
  try {
    const response = await axiosInstance.put(`/products/${id}`, productDetails)
    return response.data
  } catch (error) {
    console.error('Failed to update product details:', error)
    throw error
  }
}

export default updateProductDetails
