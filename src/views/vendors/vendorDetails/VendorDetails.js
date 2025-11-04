import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CRow,
  CImage,
  CSpinner,
  CAlert,
  CBadge,
  CButton,
  CForm, // Import Form elements
  CFormInput,
  CFormLabel,
  CFormSelect,
  CFormSwitch,
} from '@coreui/react'
import { getVendorById } from '../../../api/vendor/getVendorById'
import { updateVendorAsAdmin } from '../../../api/vendor/updateVendorAsAdmin' // <-- Import new API
import CIcon from '@coreui/icons-react'
import { cilArrowLeft, cilPencil } from '@coreui/icons'

const VendorDetails = () => {
  const { vendorId } = useParams()
  const navigate = useNavigate()

  // State for data
  const [vendor, setVendor] = useState(null) // Stores the original, read-only data
  const [formData, setFormData] = useState(null) // Stores the data for the form fields

  // State for UI
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [userRole, setUserRole] = useState('')
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  // --- Data Fetching and Role Check ---

  useEffect(() => {
    // Check admin role from localStorage
    try {
      const localUser = JSON.parse(localStorage.getItem('user'))
      if (localUser && localUser.role) {
        setUserRole(localUser.role)
      }
    } catch (error) {
      console.error('Failed to parse user data from localStorage', error)
    }

    // Fetch vendor details
    const fetchVendorDetails = async () => {
      try {
        setLoading(true)
        const response = await getVendorById(vendorId)
        if (response && response.vendor) {
          setVendor(response.vendor)
          setFormData(response.vendor) // IMPORTANT: Initialize form data
        } else {
          setError('Vendor not found.')
        }
      } catch (err) {
        setError('Failed to fetch vendor details.')
        console.error('Error fetching vendor details:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchVendorDetails()
  }, [vendorId])

  // --- Change Handlers for Nested State ---

  // For top-level fields like 'name', 'email'
  const handleSimpleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  // For fields inside 'vendorInfo', 'bankDetails', 'upiDetails'
  const handleNestedChange = (e, parentKey) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [parentKey]: {
        ...prev[parentKey],
        [name]: value,
      },
    }))
  }

  // For fields inside 'location.address'
  const handleAddressChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      location: {
        ...prev.location,
        address: {
          ...prev.location.address,
          [name]: value,
        },
      },
    }))
  }

  // For switch/checkbox fields
  const handleSwitchChange = (e, name) => {
    setFormData((prev) => ({ ...prev, [name]: e.target.checked }))
  }

  // --- Form Submission ---

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSaving(true)
    setError('')
    try {
      // We don't want to send the entire vendor object, especially not 'documents'
      // The backend 'allowedUpdates' will filter, but it's good practice.
      const updatePayload = {
        name: formData.name,
        email: formData.email,
        vendorInfo: formData.vendorInfo,
        location: formData.location,
        bankDetails: formData.bankDetails,
        upiDetails: formData.upiDetails,
        isOnline: formData.isOnline,
        status: formData.status,
        // category: formData.category, // Add this if you make it editable
      }

      const updatedVendor = await updateVendorAsAdmin(vendorId, updatePayload)
      setVendor(updatedVendor) // Update the read-only view
      setFormData(updatedVendor) // Update the form data
      setIsEditing(false)
    } catch (err) {
      setError('Failed to save changes. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  // --- Helper Functions ---

  const renderDocumentImage = (url, altText) => {
    if (!url) return <p className="text-muted">Not Provided</p>
    return (
      <a href={url} target="_blank" rel="noopener noreferrer">
        <CImage thumbnail src={url} alt={altText} width={150} height={150} className="mb-2 me-2" />
      </a>
    )
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleString()
  }

  // --- Render Logic ---

  if (loading) {
    return (
      <CRow className="justify-content-center align-items-center" style={{ minHeight: '200px' }}>
        <CSpinner color="primary" />
      </CRow>
    )
  }

  if (error && !isEditing) {
    // Only show critical errors if not in edit mode
    return <CAlert color="danger">{error}</CAlert>
  }

  if (!vendor || !formData) {
    return <CAlert color="warning">No vendor data available.</CAlert>
  }

  const fullAddress = [
    vendor.location?.address?.addressLine1,
    vendor.location?.address?.addressLine2,
    // ...
  ]
    .filter(Boolean)
    .join(', ')

  // This component dynamically renders either text or an input
  const EditableField = ({
    label,
    value,
    name,
    onChange,
    isEditing,
    type = 'text',
    parentKey, // e.g., 'vendorInfo'
    grandparentKey, // e.g., 'location'
  }) => {
    let changeHandler = handleSimpleChange
    if (grandparentKey) {
      changeHandler = handleAddressChange // Assumes grandparent is 'location'
    } else if (parentKey) {
      changeHandler = (e) => handleNestedChange(e, parentKey)
    }

    return (
      <div className="mb-3">
        <CFormLabel htmlFor={name}>
          <strong>{label}</strong>
        </CFormLabel>
        {isEditing ? (
          <CFormInput
            type={type}
            id={name}
            name={name}
            value={value || ''}
            onChange={changeHandler}
          />
        ) : (
          <p>{value || 'N/A'}</p>
        )}
      </div>
    )
  }

  return (
    <CForm onSubmit={handleSubmit}>
      <CRow>
        <CCol xs={12}>
          <CCard className="mb-4">
            <CCardHeader className="d-flex justify-content-between align-items-center">
              <strong>Vendor Registration Details</strong>
              <div>
                {/* --- Admin Edit/Save Buttons --- */}
                {userRole === 'admin' && !isEditing && (
                  <CButton color="primary" onClick={() => setIsEditing(true)}>
                    <CIcon icon={cilPencil} className="me-2" />
                    Edit Vendor
                  </CButton>
                )}
                {userRole === 'admin' && isEditing && (
                  <>
                    <CButton
                      color="secondary"
                      onClick={() => {
                        setIsEditing(false)
                        setFormData(vendor) // Reset form to original data
                        setError('')
                      }}
                      className="me-2"
                      disabled={isSaving}
                    >
                      Cancel
                    </CButton>
                    <CButton color="success" type="submit" disabled={isSaving}>
                      {isSaving ? <CSpinner size="sm" /> : 'Save Changes'}
                    </CButton>
                  </>
                )}
              </div>
            </CCardHeader>
            <CCardBody>
              {isEditing && error && <CAlert color="danger">{error}</CAlert>}

              {/* Personal and Business Information */}
              <CRow className="mb-4">
                <CCol md={6}>
                  <h5>Personal Information</h5>
                  <EditableField
                    label="Name"
                    value={formData.name}
                    name="name"
                    isEditing={isEditing}
                  />
                  <EditableField
                    label="Email"
                    value={formData.email}
                    name="email"
                    isEditing={isEditing}
                    type="email"
                  />
                  <p>
                    <strong>Role:</strong> <CBadge color="info">{vendor.role || 'N/A'}</CBadge>
                  </p>
                </CCol>
                <CCol md={6}>
                  <h5>Business Information</h5>
                  <EditableField
                    label="Business Name"
                    value={formData.vendorInfo?.businessName}
                    name="businessName"
                    isEditing={isEditing}
                    parentKey="vendorInfo"
                  />
                  <EditableField
                    label="Contact Number"
                    value={formData.vendorInfo?.contactNumber}
                    name="contactNumber"
                    isEditing={isEditing}
                    parentKey="vendorInfo"
                  />
                  <EditableField
                    label="Alternative Contact"
                    value={formData.vendorInfo?.alternativeContactNumber}
                    name="alternativeContactNumber"
                    isEditing={isEditing}
                    parentKey="vendorInfo"
                  />
                  <p>
                    <strong>Category:</strong> {vendor.category?.name || 'N/A'}
                    {/* Note: Editing category (an object) is complex. Leave as read-only for now unless you use a dropdown. */}
                  </p>
                </CCol>
              </CRow>
              <hr />

              {/* Location Information */}
              <CRow className="mb-4">
                <CCol>
                  <h5>Location</h5>
                  <EditableField
                    label="Address Line 1"
                    value={formData.location?.address?.addressLine1}
                    name="addressLine1"
                    isEditing={isEditing}
                    grandparentKey="location"
                  />
                  <EditableField
                    label="Address Line 2"
                    value={formData.location?.address?.addressLine2}
                    name="addressLine2"
                    isEditing={isEditing}
                    grandparentKey="location"
                  />
                  {/* ... Add more editable fields for landmark, city, postalCode, etc. ... */}
                  <p>
                    <strong>Full Address (Read-Only):</strong> {fullAddress || 'N/A'}
                  </p>
                  <p>
                    <strong>Serviceable Pincodes (Read-Only):</strong>{' '}
                    {vendor.location?.address?.postalCodes?.join(', ') || 'N/A'}
                    {/* Editing an array is complex, leave as read-only for this step. */}
                  </p>
                </CCol>
              </CRow>
              <hr />

              {/* Account Status */}
              <CRow className="mb-4">
                <CCol>
                  <h5>Account Status</h5>
                  <div className="mb-3">
                    <CFormLabel>
                      <strong>Online Status</strong>
                    </CFormLabel>
                    {isEditing ? (
                      <CFormSwitch
                        label={formData.isOnline ? 'Online' : 'Offline'}
                        checked={formData.isOnline}
                        onChange={(e) => handleSwitchChange(e, 'isOnline')}
                      />
                    ) : (
                      <p>
                        {vendor.isOnline ? (
                          <CBadge color="success">Online</CBadge>
                        ) : (
                          <CBadge color="danger">Offline</CBadge>
                        )}
                      </p>
                    )}
                  </div>
                  <div className="mb-3">
                    <CFormLabel>
                      <strong>Account Status</strong>
                    </CFormLabel>
                    {isEditing ? (
                      <CFormSelect
                        name="status"
                        value={formData.status}
                        onChange={handleSimpleChange}
                        options={[
                          { label: 'Pending', value: 'pending' },
                          { label: 'Online', value: 'online' },
                          { label: 'Offline', value: 'offline' },
                          { label: 'Rejected', value: 'rejected' },
                        ]}
                      />
                    ) : (
                      <p>
                        <CBadge color={vendor.status === 'online' ? 'success' : 'secondary'}>
                          {vendor.status}
                        </CBadge>
                      </p>
                    )}
                  </div>
                  <p>
                    <strong>Restricted:</strong>{' '}
                    {vendor.isRestricted ? (
                      <CBadge color="danger">Yes</CBadge>
                    ) : (
                      <CBadge color="success">No</CBadge>
                    )}
                    <br />
                    <small>(Restriction is handled from the Vendor List)</small>
                  </p>
                </CCol>
              </CRow>
              <hr />

              {/* Documents - READ ONLY */}
              <CRow className="mb-4">
                <CCol>
                  <h5>Uploaded Documents (Read-Only)</h5>
                  {/* Document editing (file upload) is complex and should be a separate feature. */}
                  {/* ... (document rendering code) ... */}
                </CCol>
              </CRow>
              <hr />

              {/* Timestamps - READ ONLY */}
              <CRow>
                <CCol>
                  <h5>Timestamps (Read-Only)</h5>
                  <p>
                    <strong>Created At:</strong> {formatDate(vendor.createdAt)}
                  </p>
                  <p>
                    <strong>Last Updated At:</strong> {formatDate(vendor.updatedAt)}
                  </p>
                </CCol>
              </CRow>
            </CCardBody>
          </CCard>

          {/* Bank and UPI Details Card */}
          <CCard className="mb-4">
            <CCardHeader>
              <strong>Bank and UPI Details</strong>
            </CCardHeader>
            <CCardBody>
              <h5>Bank Details</h5>
              <EditableField
                label="Account Holder Name"
                value={formData.bankDetails?.accountHolderName}
                name="accountHolderName"
                isEditing={isEditing}
                parentKey="bankDetails"
              />
              <EditableField
                label="Account Number"
                value={formData.bankDetails?.accountNumber}
                name="accountNumber"
                isEditing={isEditing}
                parentKey="bankDetails"
              />
              <EditableField
                label="IFSC Code"
                value={formData.bankDetails?.ifscCode}
                name="ifscCode"
                isEditing={isEditing}
                parentKey="bankDetails"
              />
              <EditableField
                label="Bank Name"
                value={formData.bankDetails?.bankName}
                name="bankName"
                isEditing={isEditing}
                parentKey="bankDetails"
              />
              <hr />
              <h5>UPI Details</h5>
              <EditableField
                label="UPI ID"
                value={formData.upiDetails?.upiId}
                name="upiId"
                isEditing={isEditing}
                parentKey="upiDetails"
              />
              <EditableField
                label="UPI Phone Number"
                value={formData.upiDetails?.upiPhoneNumber}
                name="upiPhoneNumber"
                isEditing={isEditing}
                parentKey="upiDetails"
              />
              {/* QR Code is read-only */}
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
    </CForm>
  )
}

export default VendorDetails
