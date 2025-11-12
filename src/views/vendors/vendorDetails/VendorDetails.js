//vendors/vendorDetails/VendorDetails.js
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
  CForm,
  CFormInput,
  CFormLabel,
  CFormSelect,
  CFormSwitch,
} from '@coreui/react'
import { getVendorById } from '../../../api/vendor/getVendorById'
import { updateVendorAsAdmin } from '../../../api/vendor/updateVendorAsAdmin'
import CIcon from '@coreui/icons-react'
import { cilPencil, cilCloudUpload, cilCheckCircle, cilCloudDownload } from '@coreui/icons'
import { generateVendorPDF } from './GeneratePdf'
const VendorDetails = () => {
  const { vendorId } = useParams()
  const navigate = useNavigate()

  // State for data
  const [vendor, setVendor] = useState(null)
  const [formData, setFormData] = useState(null)

  // State for UI
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [userRole, setUserRole] = useState('')
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  // NEW: State for document actions
  const [documentActions, setDocumentActions] = useState({
    shopPhoto: 'keep',
    shopVideo: 'keep',
    selfiePhoto: 'keep',
    aadharFrontDocument: 'keep',
    aadharBackDocument: 'keep',
    panCardDocument: 'keep',
    gstCertificate: 'keep',
    fssaiCertificate: 'keep',
  })
  const [qrCodeAction, setQrCodeAction] = useState('keep')

  // State for file uploads
  const [documentFiles, setDocumentFiles] = useState({
    shopPhoto: null,
    shopVideo: null,
    selfiePhoto: null,
    aadharFrontDocument: null,
    aadharBackDocument: null,
    panCardDocument: null,
    gstCertificate: null,
    fssaiCertificate: null,
  })
  const [qrCodeFile, setQrCodeFile] = useState(null)

  // State for image previews
  const [documentPreviews, setDocumentPreviews] = useState({
    shopPhoto: [],
    shopVideo: [],
    selfiePhoto: null,
    aadharFrontDocument: null,
    aadharBackDocument: null,
    panCardDocument: null,
    gstCertificate: null,
    fssaiCertificate: null,
  })
  const [qrCodePreview, setQrCodePreview] = useState(null)

  // --- Data Fetching and Role Check ---
  useEffect(() => {
    try {
      const localUser = JSON.parse(localStorage.getItem('user'))
      if (localUser && localUser.role) {
        setUserRole(localUser.role)
      }
    } catch (error) {
      console.error('Failed to parse user data from localStorage', error)
    }

    const fetchVendorDetails = async () => {
      try {
        setLoading(true)
        const response = await getVendorById(vendorId)
        if (response && response.vendor) {
          setVendor(response.vendor)
          setFormData(response.vendor)
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

  // --- Change Handlers ---
  const handleSimpleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

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

  const handleSwitchChange = (e, name) => {
    setFormData((prev) => ({ ...prev, [name]: e.target.checked }))
  }

  // NEW: Handle action changes
  const handleDocumentActionChange = (docType, action) => {
    setDocumentActions((prev) => ({ ...prev, [docType]: action }))

    // Reset files and previews when changing to 'keep'
    if (action === 'keep') {
      setDocumentFiles((prev) => ({ ...prev, [docType]: null }))
      if (docType === 'shopPhoto') {
        setDocumentPreviews((prev) => ({ ...prev, [docType]: [] }))
      } else {
        setDocumentPreviews((prev) => ({ ...prev, [docType]: null }))
      }
    }
  }

  const handleQrCodeActionChange = (action) => {
    setQrCodeAction(action)
    if (action === 'keep') {
      setQrCodeFile(null)
      setQrCodePreview(null)
    }
  }

  // Handle file input changes for documents
  const handleDocumentFileChange = (e, docType) => {
    if (docType === 'shopPhoto' || docType === 'shopVideo') {
      const files = Array.from(e.target.files)
      if (files.length > 0) {
        setDocumentFiles((prev) => ({ ...prev, [docType]: files }))
        const previews = files.map((file) => URL.createObjectURL(file))
        setDocumentPreviews((prev) => ({ ...prev, [docType]: previews }))
      }
    } else {
      const file = e.target.files[0]
      if (file) {
        setDocumentFiles((prev) => ({ ...prev, [docType]: file }))
        const preview = URL.createObjectURL(file)
        setDocumentPreviews((prev) => ({ ...prev, [docType]: preview }))
      }
    }
  }

  // Handle QR code file change
  const handleQrCodeFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setQrCodeFile(file)
      const preview = URL.createObjectURL(file)
      setQrCodePreview(preview)
    }
  }

  // --- Form Submission ---
  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSaving(true)
    setError('')
    try {
      // Check if we have any file uploads or non-keep actions
      const hasFileUploads =
        Object.values(documentFiles).some((file) => file !== null) || qrCodeFile !== null
      const hasActions =
        Object.values(documentActions).some((action) => action !== 'keep') ||
        qrCodeAction !== 'keep'

      if (hasFileUploads || hasActions) {
        const formDataToSend = new FormData()

        // Add basic fields
        formDataToSend.append('name', formData.name)
        formDataToSend.append('email', formData.email)
        formDataToSend.append('isOnline', formData.isOnline)
        formDataToSend.append('status', formData.status)

        // Add nested objects as JSON strings
        formDataToSend.append('vendorInfo', JSON.stringify(formData.vendorInfo))
        formDataToSend.append('location', JSON.stringify(formData.location))
        formDataToSend.append('bankDetails', JSON.stringify(formData.bankDetails))

        // For UPI details, only include qrCode if not uploading file
        const upiDetailsToSend = { ...formData.upiDetails }
        if (qrCodeFile) {
          delete upiDetailsToSend.qrCode
        }
        formDataToSend.append('upiDetails', JSON.stringify(upiDetailsToSend))

        // Add document actions
        formDataToSend.append(
          'documentActions',
          JSON.stringify({
            ...documentActions,
            qrCode: qrCodeAction,
          }),
        )

        // Add document files if they exist
        Object.keys(documentFiles).forEach((key) => {
          if (documentFiles[key]) {
            if (key === 'shopPhoto' && Array.isArray(documentFiles[key])) {
              // Shop photos - append each with 'shopPhoto' fieldname
              documentFiles[key].forEach((file) => {
                formDataToSend.append('shopPhoto', file)
              })
            } else if (key === 'shopVideo' && Array.isArray(documentFiles[key])) {
              // Shop videos - append each with 'shopVideo' fieldname
              documentFiles[key].forEach((file) => {
                formDataToSend.append('shopVideo', file)
              })
            } else {
              // Other single document files
              formDataToSend.append(key, documentFiles[key])
            }
          }
        })

        // Add QR code file if it exists
        if (qrCodeFile) {
          formDataToSend.append('qrCode', qrCodeFile)
        }

        const updatedVendor = await updateVendorAsAdmin(vendorId, formDataToSend)
        setVendor(updatedVendor)
        setFormData(updatedVendor)
      } else {
        // No files or actions, send as regular JSON
        const updatePayload = {
          name: formData.name,
          email: formData.email,
          vendorInfo: formData.vendorInfo,
          location: formData.location,
          bankDetails: formData.bankDetails,
          upiDetails: formData.upiDetails,
          isOnline: formData.isOnline,
          status: formData.status,
        }

        const updatedVendor = await updateVendorAsAdmin(vendorId, updatePayload)
        setVendor(updatedVendor)
        setFormData(updatedVendor)
      }

      setIsEditing(false)

      // Reset everything
      setDocumentFiles({
        shopPhoto: null,
        shopVideo: null,
        selfiePhoto: null,
        aadharFrontDocument: null,
        aadharBackDocument: null,
        panCardDocument: null,
        gstCertificate: null,
        fssaiCertificate: null,
      })
      setQrCodeFile(null)
      setDocumentActions({
        shopPhoto: 'keep',
        shopVideo: 'keep',
        selfiePhoto: 'keep',
        aadharFrontDocument: 'keep',
        aadharBackDocument: 'keep',
        panCardDocument: 'keep',
        gstCertificate: 'keep',
        fssaiCertificate: 'keep',
      })
      setQrCodeAction('keep')

      // Clean up preview URLs
      Object.values(documentPreviews).forEach((preview) => {
        if (Array.isArray(preview)) {
          preview.forEach((url) => URL.revokeObjectURL(url))
        } else if (preview) {
          URL.revokeObjectURL(preview)
        }
      })
      if (qrCodePreview) {
        URL.revokeObjectURL(qrCodePreview)
      }

      setDocumentPreviews({
        shopPhoto: [],
        shopVideo: [],
        selfiePhoto: null,
        aadharFrontDocument: null,
        aadharBackDocument: null,
        panCardDocument: null,
        gstCertificate: null,
        fssaiCertificate: null,
      })
      setQrCodePreview(null)
    } catch (err) {
      setError('Failed to save changes. Please try again.')
      console.error('Submit error:', err)
    } finally {
      setIsSaving(false)
    }
  }

  // --- Helper Functions ---
  const renderDocumentImage = (url, altText, willBeDeleted = false) => {
    if (!url) return <p className="text-muted">Not Provided</p>
    return (
      <div className="position-relative d-inline-block">
        <a href={url} target="_blank" rel="noopener noreferrer">
          <CImage
            thumbnail
            src={url}
            alt={altText}
            width={150}
            height={150}
            className={`mb-2 me-2 ${willBeDeleted ? 'opacity-50 border border-danger border-2' : ''}`}
          />
        </a>
        {willBeDeleted && (
          <CBadge
            color="danger"
            className="position-absolute"
            style={{ top: '5px', right: '10px' }}
          >
            Will Delete
          </CBadge>
        )}
      </div>
    )
  }

  const renderPreviewImage = (url, altText) => {
    if (!url) return null
    return (
      <div className="position-relative d-inline-block">
        <CImage
          thumbnail
          src={url}
          alt={altText}
          width={150}
          height={150}
          className="mb-2 me-2 border border-success border-3"
        />
        <CBadge color="success" className="position-absolute" style={{ top: '5px', right: '10px' }}>
          New
        </CBadge>
      </div>
    )
  }

  const renderDocumentVideo = (url, altText, willBeDeleted = false) => {
    if (!url) return <p className="text-muted">Not Provided</p>
    return (
      <div className="position-relative d-inline-block">
        <video
          src={url}
          alt={altText}
          width={150}
          height={150}
          className={`mb-2 me-2 ${willBeDeleted ? 'opacity-50 border border-danger border-2' : ''}`}
          controls
        />
        {willBeDeleted && (
          <CBadge
            color="danger"
            className="position-absolute"
            style={{ top: '5px', right: '10px' }}
          >
            Will Delete
          </CBadge>
        )}
      </div>
    )
  }

  const renderPreviewVideo = (url, altText) => {
    if (!url) return null
    return (
      <div className="position-relative d-inline-block">
        <video
          src={url}
          alt={altText}
          width={150}
          height={150}
          className="mb-2 me-2 border border-success border-3"
          controls
        />
        <CBadge color="success" className="position-absolute" style={{ top: '5px', right: '10px' }}>
          New
        </CBadge>
      </div>
    )
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleString()
  }

  // Editable document field component with action buttons
  const EditableDocumentField = ({ label, docType, url, isArray = false }) => {
    const action = documentActions[docType]
    const hasNewUpload = isArray
      ? documentPreviews[docType]?.length > 0
      : documentPreviews[docType] !== null

    const isVideo = docType === 'shopVideo'

    return (
      <div className="mb-4 p-3 border rounded">
        <CFormLabel className="fw-bold fs-6 mb-3">{label}</CFormLabel>

        {isEditing && (
          <>
            {/* Action Selector */}
            <div className="mb-3 bg-light p-2 rounded">
              <small className="text-muted d-block mb-2">Choose action:</small>
              <div className="d-flex gap-2 flex-wrap">
                <CButton
                  color={action === 'keep' ? 'success' : 'outline-secondary'}
                  size="sm"
                  onClick={() => handleDocumentActionChange(docType, 'keep')}
                >
                  ✓ Keep Existing
                </CButton>
                <CButton
                  color={action === 'replace' ? 'warning' : 'outline-secondary'}
                  size="sm"
                  onClick={() => handleDocumentActionChange(docType, 'replace')}
                >
                  🔄 Replace
                </CButton>
                {isArray && (
                  <CButton
                    color={action === 'add' ? 'primary' : 'outline-secondary'}
                    size="sm"
                    onClick={() => handleDocumentActionChange(docType, 'add')}
                  >
                    + Add More
                  </CButton>
                )}
              </div>
            </div>

            {/* File Upload (shown when replace or add is selected) */}
            {(action === 'replace' || action === 'add') && (
              <div className="mb-3">
                <CFormInput
                  type="file"
                  accept={isVideo ? 'video/*' : 'image/*,application/pdf'}
                  onChange={(e) => handleDocumentFileChange(e, docType)}
                  className="mb-2"
                  multiple={isArray && action === 'add'}
                />
                <small className="text-muted d-block">
                  {action === 'replace'
                    ? '⚠️ Old image(s) will be deleted and replaced'
                    : '➕ New images will be added to existing ones'}
                </small>
                {hasNewUpload && (
                  <CAlert color="success" className="mt-2 py-1 px-2 small mb-0">
                    ✓ {isArray ? `${documentPreviews[docType].length} file(s)` : '1 file'} ready to
                    upload
                  </CAlert>
                )}
              </div>
            )}
          </>
        )}

        {/* Preview Section */}
        <div className="mt-3">
          {/* Show new uploads */}
          {hasNewUpload && (
            <div className="mb-3">
              <small className="text-success fw-bold d-block mb-2">
                {action === 'replace' ? '🔄 Will Replace With:' : '➕ Will Add:'}
              </small>
              <div className="d-flex gap-2 flex-wrap">
                {isArray
                  ? documentPreviews[docType].map((preview, idx) => (
                      <div key={idx}>
                        {isVideo
                          ? renderPreviewVideo(preview, `${label} ${idx + 1} (New)`)
                          : renderPreviewImage(preview, `${label} ${idx + 1} (New)`)}
                      </div>
                    ))
                  : isVideo
                    ? renderPreviewVideo(documentPreviews[docType], `${label} (New)`)
                    : renderPreviewImage(documentPreviews[docType], `${label} (New)`)}
              </div>
            </div>
          )}

          {/* Show current documents */}
          <div>
            <small className="text-muted fw-bold d-block mb-2">
              {action === 'replace'
                ? '❌ Will Be Deleted:'
                : action === 'add'
                  ? '✓ Will Be Kept:'
                  : 'Current Document(s):'}
            </small>
            <div className="d-flex gap-2 flex-wrap">
              {isArray ? (
                url && url.length > 0 ? (
                  url.map((itemUrl, idx) => (
                    <div key={idx}>
                      {isVideo
                        ? renderDocumentVideo(itemUrl, `${label} ${idx + 1}`, action === 'replace')
                        : renderDocumentImage(itemUrl, `${label} ${idx + 1}`, action === 'replace')}
                    </div>
                  ))
                ) : (
                  <p className="text-muted">Not Provided</p>
                )
              ) : isVideo ? (
                renderDocumentVideo(url, label, action === 'replace')
              ) : (
                renderDocumentImage(url, label, action === 'replace')
              )}
            </div>
          </div>

          {/* Summary Alert */}
          {action !== 'keep' && (
            <CAlert
              color={action === 'replace' ? 'warning' : 'info'}
              className="mt-3 py-2 px-3 small mb-0"
            >
              <strong>Summary:</strong>{' '}
              {action === 'replace'
                ? 'Old image(s) will be permanently deleted from S3 and replaced with new upload(s)'
                : 'New image(s) will be added while keeping all existing images'}
            </CAlert>
          )}
        </div>
      </div>
    )
  }

  const EditableField = ({
    label,
    value,
    name,
    isEditing,
    type = 'text',
    parentKey,
    grandparentKey,
  }) => {
    let changeHandler = handleSimpleChange
    if (grandparentKey) {
      changeHandler = handleAddressChange
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

  // --- Render Logic ---
  if (loading) {
    return (
      <CRow className="justify-content-center align-items-center" style={{ minHeight: '200px' }}>
        <CSpinner color="primary" />
      </CRow>
    )
  }

  if (error && !isEditing) {
    return <CAlert color="danger">{error}</CAlert>
  }

  if (!vendor || !formData) {
    return <CAlert color="warning">No vendor data available.</CAlert>
  }

  const fullAddress = [
    vendor.location?.address?.addressLine1,
    vendor.location?.address?.addressLine2,
    vendor.location?.address?.landmark,
    vendor.location?.address?.city,
    vendor.location?.address?.state,
    vendor.location?.address?.postalCode,
  ]
    .filter(Boolean)
    .join(', ')

  return (
    <CForm onSubmit={handleSubmit}>
      <CRow>
        <CCol xs={12}>
          {/* Main Vendor Details Card */}
          <CCard className="mb-4">
            <CCardHeader className="d-flex justify-content-between align-items-center">
              <strong>Vendor Registration Details</strong>
              <div>
                <CButton color="info" onClick={() => generateVendorPDF(vendor)} className="me-2">
                  <CIcon icon={cilCloudDownload} className="me-2" />
                  Download PDF
                </CButton>
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
                        setFormData(vendor)
                        setError('')

                        // Reset everything
                        setDocumentFiles({
                          shopPhoto: null,
                          shopVideo: null,
                          selfiePhoto: null,
                          aadharFrontDocument: null,
                          aadharBackDocument: null,
                          panCardDocument: null,
                          gstCertificate: null,
                          fssaiCertificate: null,
                        })
                        setQrCodeFile(null)
                        setDocumentActions({
                          shopPhoto: 'keep',
                          shopVideo: 'keep',
                          selfiePhoto: 'keep',
                          aadharFrontDocument: 'keep',
                          aadharBackDocument: 'keep',
                          panCardDocument: 'keep',
                          gstCertificate: 'keep',
                          fssaiCertificate: 'keep',
                        })
                        setQrCodeAction('keep')

                        // Clean up preview URLs
                        Object.values(documentPreviews).forEach((preview) => {
                          if (Array.isArray(preview)) {
                            preview.forEach((url) => URL.revokeObjectURL(url))
                          } else if (preview) {
                            URL.revokeObjectURL(preview)
                          }
                        })
                        if (qrCodePreview) {
                          URL.revokeObjectURL(qrCodePreview)
                        }

                        setDocumentPreviews({
                          shopPhoto: [],
                          shopVideo: [],
                          selfiePhoto: null,
                          aadharFrontDocument: null,
                          aadharBackDocument: null,
                          panCardDocument: null,
                          gstCertificate: null,
                          fssaiCertificate: null,
                        })
                        setQrCodePreview(null)
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

              {/* Show action summary */}
              {isEditing &&
                (Object.values(documentFiles).some((f) => f !== null) || qrCodeFile) && (
                  <CAlert color="info" className="d-flex align-items-center">
                    <CIcon icon={cilCloudUpload} className="me-2" size="lg" />
                    <div className="flex-grow-1">
                      <strong>Pending Changes:</strong>
                      <ul className="mb-0 mt-1">
                        {Object.entries(documentFiles).map(([key, file]) => {
                          if (!file) return null
                          const action = documentActions[key]
                          if (Array.isArray(file)) {
                            return (
                              <li key={key}>
                                {key}: {action === 'add' ? 'Add' : 'Replace'} {file.length} file(s)
                              </li>
                            )
                          }
                          return (
                            <li key={key}>
                              {key}: Replace with {file.name}
                            </li>
                          )
                        })}
                        {qrCodeFile && (
                          <li>QR Code: {qrCodeAction === 'replace' ? 'Replace' : 'Update'}</li>
                        )}
                      </ul>
                    </div>
                  </CAlert>
                )}

              {/* Show success message */}
              {!isEditing && !loading && !error && (
                <CAlert color="success" className="d-flex align-items-center mb-3">
                  <CIcon icon={cilCheckCircle} className="me-2" size="lg" />
                  <span>Vendor details are up to date</span>
                </CAlert>
              )}

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
                  <EditableField
                    label="Landmark"
                    value={formData.location?.address?.landmark}
                    name="landmark"
                    isEditing={isEditing}
                    grandparentKey="location"
                  />
                  <EditableField
                    label="City"
                    value={formData.location?.address?.city}
                    name="city"
                    isEditing={isEditing}
                    grandparentKey="location"
                  />
                  <EditableField
                    label="State"
                    value={formData.location?.address?.state}
                    name="state"
                    isEditing={isEditing}
                    grandparentKey="location"
                  />
                  <EditableField
                    label="Postal Code"
                    value={formData.location?.address?.postalCode}
                    name="postalCode"
                    isEditing={isEditing}
                    grandparentKey="location"
                  />
                  <p>
                    <strong>Full Address:</strong> {fullAddress || 'N/A'}
                  </p>
                  <p>
                    <strong>Serviceable Pincodes:</strong>{' '}
                    {vendor.location?.address?.postalCodes?.join(', ') || 'N/A'}
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
                  </p>
                </CCol>
              </CRow>
              <hr />

              {/* Timestamps */}
              <CRow>
                <CCol>
                  <h5>Timestamps</h5>
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

          {/* Documents Card */}
          <CCard className="mb-4">
            <CCardHeader>
              <strong>Uploaded Documents</strong>
            </CCardHeader>
            <CCardBody>
              <CRow>
                <CCol md={6}>
                  <EditableDocumentField
                    label="Shop Photos"
                    docType="shopPhoto"
                    url={formData.documents?.shopPhoto}
                    isArray={true}
                  />
                </CCol>
                <CCol md={6}>
                  <EditableDocumentField
                    label="Shop Videos"
                    docType="shopVideo"
                    url={formData.documents?.shopVideo}
                    isArray={true}
                  />
                </CCol>
                <CCol md={6}>
                  <EditableDocumentField
                    label="Selfie Photo"
                    docType="selfiePhoto"
                    url={formData.documents?.selfiePhoto}
                  />
                </CCol>
              </CRow>
              <CRow>
                <CCol md={6}>
                  <EditableDocumentField
                    label="Aadhar Front"
                    docType="aadharFrontDocument"
                    url={formData.documents?.aadharFrontDocument}
                  />
                </CCol>
                <CCol md={6}>
                  <EditableDocumentField
                    label="Aadhar Back"
                    docType="aadharBackDocument"
                    url={formData.documents?.aadharBackDocument}
                  />
                </CCol>
              </CRow>
              <CRow>
                <CCol md={6}>
                  <EditableDocumentField
                    label="PAN Card"
                    docType="panCardDocument"
                    url={formData.documents?.panCardDocument}
                  />
                </CCol>
                <CCol md={6}>
                  <EditableDocumentField
                    label="GST Certificate"
                    docType="gstCertificate"
                    url={formData.documents?.gstCertificate}
                  />
                </CCol>
              </CRow>
              <CRow>
                <CCol md={6}>
                  <EditableDocumentField
                    label="FSSAI Certificate"
                    docType="fssaiCertificate"
                    url={formData.documents?.fssaiCertificate}
                  />
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
              <CRow>
                <CCol md={6}>
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
                </CCol>
                <CCol md={6}>
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
                </CCol>
              </CRow>
              <hr />
              <h5>UPI Details</h5>
              <CRow>
                <CCol md={6}>
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
                </CCol>
                <CCol md={6}>
                  <div className="mb-4 p-3 border rounded">
                    <CFormLabel className="fw-bold fs-6 mb-3">UPI QR Code</CFormLabel>

                    {isEditing && (
                      <>
                        {/* Action Selector */}
                        <div className="mb-3 bg-light p-2 rounded">
                          <small className="text-muted d-block mb-2">Choose action:</small>
                          <div className="d-flex gap-2 flex-wrap">
                            <CButton
                              color={qrCodeAction === 'keep' ? 'success' : 'outline-secondary'}
                              size="sm"
                              onClick={() => handleQrCodeActionChange('keep')}
                            >
                              ✓ Keep Existing
                            </CButton>
                            <CButton
                              color={qrCodeAction === 'replace' ? 'warning' : 'outline-secondary'}
                              size="sm"
                              onClick={() => handleQrCodeActionChange('replace')}
                            >
                              🔄 Replace
                            </CButton>
                          </div>
                        </div>

                        {/* File Upload */}
                        {qrCodeAction === 'replace' && (
                          <div className="mb-3">
                            <CFormInput
                              type="file"
                              accept="image/*"
                              onChange={handleQrCodeFileChange}
                              className="mb-2"
                            />
                            <small className="text-muted d-block">
                              ⚠️ Old QR code will be deleted and replaced
                            </small>
                            {qrCodePreview && (
                              <CAlert color="success" className="mt-2 py-1 px-2 small mb-0">
                                ✓ New QR code ready to upload
                              </CAlert>
                            )}
                          </div>
                        )}
                      </>
                    )}

                    <div className="mt-3">
                      {/* Show new QR code preview */}
                      {qrCodePreview && (
                        <div className="mb-3">
                          <small className="text-success fw-bold d-block mb-2">
                            🔄 Will Replace With:
                          </small>
                          {renderPreviewImage(qrCodePreview, 'UPI QR Code (New)')}
                        </div>
                      )}

                      {/* Show current QR code */}
                      <div>
                        <small className="text-muted fw-bold d-block mb-2">
                          {qrCodeAction === 'replace' ? '❌ Will Be Deleted:' : 'Current QR Code:'}
                        </small>
                        {renderDocumentImage(
                          formData.upiDetails?.qrCode,
                          'UPI QR Code',
                          qrCodeAction === 'replace',
                        )}
                      </div>

                      {/* Summary Alert */}
                      {qrCodeAction === 'replace' && (
                        <CAlert color="warning" className="mt-3 py-2 px-3 small mb-0">
                          <strong>Summary:</strong> Old QR code will be permanently deleted from S3
                          and replaced with new upload
                        </CAlert>
                      )}
                    </div>
                  </div>
                </CCol>
              </CRow>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
    </CForm>
  )
}

export default VendorDetails
