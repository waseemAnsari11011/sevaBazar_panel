import axiosInstance from '../../utils/axiosConfig'

const deleteVendor = async (vendorId) => {
  try {
    const response = await axiosInstance.delete(`/vendors/admin/${vendorId}`)
    return response.data
  } catch (error) {
    throw error.response ? error.response.data : new Error('Network Error')
  }
}

export default deleteVendor
