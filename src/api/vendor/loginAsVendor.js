// api/vendor/loginAsVendor.js
import axiosInstance from '../../utils/axiosConfig'

export const loginAsVendor = async (vendorId) => {
  try {
    const response = await axiosInstance.post(`/vendors/admin-login-as-vendor/${vendorId}`)
    return response.data
  } catch (error) {
    console.error('Failed to login as vendor:', error)
    throw error
  }
}
