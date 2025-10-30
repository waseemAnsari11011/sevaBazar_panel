import axiosInstance from '../../utils/axiosConfig'

export const getVendorById = async (vendorId) => {
  const token = localStorage.getItem('token')
  const response = await axiosInstance.get(`/vendors/admin/${vendorId}`, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  })
  return response.data
}
