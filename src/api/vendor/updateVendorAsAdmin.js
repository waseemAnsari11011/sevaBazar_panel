import axiosInstance from 'src/utils/axiosConfig'
import { toast } from 'react-toastify'

// This function is for an ADMIN to update ANY vendor
export const updateVendorAsAdmin = async (vendorId, data) => {
  try {
    // Note the route /vendors/:id (as defined in your admin routes)
    const res = await axiosInstance.put(`/vendors/admin/${vendorId}`, data)
    toast.success('Vendor updated successfully!')
    return res.data.vendor // Return the updated vendor
  } catch (err) {
    const errorMessage = err.response ? err.response.data.message : 'Error updating vendor'
    toast.error(errorMessage)
    console.error(err)
    throw err // Re-throw error for the component to handle
  }
}
