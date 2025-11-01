import React, { useState } from 'react'
import { CButton, CForm, CFormInput, CFormLabel, CCol, CRow, CSpinner, CAlert } from '@coreui/react'
import { updateProfile } from '../../api/vendor/updateProfile'
import { useDispatch } from 'react-redux'

const UpdateBankDetails = ({ user }) => {
  const dispatch = useDispatch()
  const [formData, setFormData] = useState({
    // Bank Details
    accountHolderName: user.bankDetails?.accountHolderName || '',
    accountNumber: user.bankDetails?.accountNumber || '',
    ifscCode: user.bankDetails?.ifscCode || '',
    bankName: user.bankDetails?.bankName || '',
    // UPI Details
    upiId: user.upiDetails?.upiId || '',
    upiPhoneNumber: user.upiDetails?.upiPhoneNumber || '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleChange = (e) => {
    const { id, value } = e.target
    setFormData((prev) => ({ ...prev, [id]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    const payload = {
      bankDetails: {
        accountHolderName: formData.accountHolderName,
        accountNumber: formData.accountNumber,
        ifscCode: formData.ifscCode,
        bankName: formData.bankName,
      },
      upiDetails: {
        upiId: formData.upiId,
        upiPhoneNumber: formData.upiPhoneNumber,
      },
    }

    try {
      const response = await updateProfile(payload)

      // Update the user in Redux state
      dispatch({ type: 'SET_USER', payload: response.vendor })

      setSuccess('Bank details updated successfully!')
    } catch (err) {
      setError(err.message || 'Failed to update bank details.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <CForm onSubmit={handleSubmit}>
      {error && <CAlert color="danger">{error}</CAlert>}
      {success && <CAlert color="success">{success}</CAlert>}

      <h5>Bank Details</h5>
      <CRow className="mb-3">
        <CCol md={6}>
          <CFormLabel htmlFor="accountHolderName">Account Holder Name</CFormLabel>
          <CFormInput
            type="text"
            id="accountHolderName"
            value={formData.accountHolderName}
            onChange={handleChange}
          />
        </CCol>
        <CCol md={6}>
          <CFormLabel htmlFor="accountNumber">Account Number</CFormLabel>
          <CFormInput
            type="text"
            id="accountNumber"
            value={formData.accountNumber}
            onChange={handleChange}
          />
        </CCol>
      </CRow>
      <CRow className="mb-3">
        <CCol md={6}>
          <CFormLabel htmlFor="ifscCode">IFSC Code</CFormLabel>
          <CFormInput type="text" id="ifscCode" value={formData.ifscCode} onChange={handleChange} />
        </CCol>
        <CCol md={6}>
          <CFormLabel htmlFor="bankName">Bank Name</CFormLabel>
          <CFormInput type="text" id="bankName" value={formData.bankName} onChange={handleChange} />
        </CCol>
      </CRow>

      <hr />
      <h5>UPI Details</h5>
      <CRow className="mb-3">
        <CCol md={6}>
          <CFormLabel htmlFor="upiId">UPI ID</CFormLabel>
          <CFormInput type="text" id="upiId" value={formData.upiId} onChange={handleChange} />
        </CCol>
        <CCol md={6}>
          <CFormLabel htmlFor="upiPhoneNumber">UPI Phone Number</CFormLabel>
          <CFormInput
            type="text"
            id="upiPhoneNumber"
            value={formData.upiPhoneNumber}
            onChange={handleChange}
          />
        </CCol>
      </CRow>

      <CButton type="submit" color="primary" disabled={loading}>
        {loading ? <CSpinner size="sm" /> : 'Save Changes'}
      </CButton>
    </CForm>
  )
}

export default UpdateBankDetails
