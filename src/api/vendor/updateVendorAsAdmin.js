import axiosInstance from 'src/utils/axiosConfig'
import { toast } from 'react-toastify'

/**
 * Update vendor as admin with file upload support
 * @param {string} vendorId - The vendor ID
 * @param {FormData|Object} data - Either FormData (for file uploads) or regular object
 * @returns {Promise} The updated vendor data
 */
export const updateVendorAsAdmin = async (vendorId, data) => {
  try {
    const isFormData = data instanceof FormData

    const config = {
      headers: {
        'Content-Type': isFormData ? 'multipart/form-data' : 'application/json',
      },
    }

    const res = await axiosInstance.put(`/vendors/admin/${vendorId}`, data, config)
    toast.success('Vendor updated successfully!')
    return res.data.vendor
  } catch (err) {
    const errorMessage =
      err.response?.data?.error || err.response?.data?.message || 'Error updating vendor'
    toast.error(errorMessage)
    console.error('Update vendor error:', err)
    throw err
  }
}
