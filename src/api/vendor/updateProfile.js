import axiosInstance from '../../utils/axiosConfig'

export const updateProfile = async (updateData) => {
  try {
    // The endpoint '/vendor/profile' assumes your API is set up with /vendor as a prefix
    // for private vendor routes. Adjust if necessary.
    const response = await axiosInstance.put('/vendors/me/profile', updateData)
    return response.data
  } catch (error) {
    console.error('Error updating profile:', error.response?.data || error.message)
    throw error.response?.data || new Error('Failed to update profile')
  }
}
