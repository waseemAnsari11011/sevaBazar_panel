import React, { useState, useEffect, useRef } from 'react'
import {
  CButton,
  CCard,
  CCardBody,
  CCol,
  CContainer,
  CForm,
  CFormInput,
  CInputGroup,
  CInputGroupText,
  CRow,
  CSpinner,
  CFormText,
  CFormSelect,
  CFormLabel,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CFormCheck,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import {
  cilLockLocked,
  cilUser,
  cilBuilding,
  cilLocationPin,
  cilPhone,
  cilList,
  cilCamera,
  cilCloudUpload,
  cilTrash,
  cilCheckCircle,
  cilWarning,
  cilEyedropper,
  cilShortText,
} from '@coreui/icons'
import axiosInstance from '../../../utils/axiosConfig'
import { useNavigate } from 'react-router-dom'
import PincodeInput from './PincodeInput'
import GooglePlacesAutocomplete, {
  geocodeByAddress,
  getLatLng,
} from 'react-google-places-autocomplete'
import { compressImageFile } from '../../../utils/imageCompression'

const Register = () => {
  const navigate = useNavigate()
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const shopPhotoInputRef = useRef(null)
  const aadharFrontInputRef = useRef(null)
  const aadharBackInputRef = useRef(null)
  const panCardInputRef = useRef(null)
  const selfiePhotoInputRef = useRef(null)

  // Form fields state
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [email, setEmail] = useState('')
  const [businessName, setBusinessName] = useState('')
  const [businessAddress, setBusinessAddress] = useState(null)
  const [landmark, setLandmark] = useState('')
  const [alternativeAddress, setAlternativeAddress] = useState('')
  const [businessPincode, setBusinessPincode] = useState('')
  const [contactNumber, setContactNumber] = useState('')
  const [alternativeContactNumber, setAlternativeContactNumber] = useState('')
  const [documentType, setDocumentType] = useState('aadhaar')

  // Location state
  const [latitude, setLatitude] = useState(null)
  const [longitude, setLongitude] = useState(null)
  const [locationStatus, setLocationStatus] = useState('')

  // Categories state
  const [categories, setCategories] = useState([])
  const [selectedCategory, setSelectedCategory] = useState('')

  // Change shopPhoto state to handle multiple files
  const [shopPhotos, setShopPhotos] = useState([])
  const [shopPhotoPreviews, setShopPhotoPreviews] = useState([])
  const [selfiePhoto, setSelfiePhoto] = useState(null)
  const [selfiePhotoPreview, setSelfiePhotoPreview] = useState(null)
  const [aadharFrontDocument, setAadharFrontDocument] = useState(null)
  const [aadharFrontDocumentPreview, setAadharFrontDocumentPreview] = useState(null)
  const [aadharBackDocument, setAadharBackDocument] = useState(null)
  const [aadharBackDocumentPreview, setAadharBackDocumentPreview] = useState(null)
  const [panCardDocument, setPanCardDocument] = useState(null)
  const [panCardDocumentPreview, setPanCardDocumentPreview] = useState(null)

  // Camera modal states
  const [showCameraModal, setShowCameraModal] = useState(false)
  const [cameraStream, setCameraStream] = useState(null)
  const [isCameraReady, setIsCameraReady] = useState(false)

  // UI state
  const [isLoading, setIsLoading] = useState(false)
  const [googleMapsLoaded, setGoogleMapsLoaded] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  // Modal states
  const [modalMessage, setModalMessage] = useState('')
  const [showErrorModal, setShowErrorModal] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)

  const [pincode, setPincode] = useState('')
  const [pincodes, setPincodes] = useState([])

  const [bankDetails, setBankDetails] = useState({
    accountHolderName: '',
    accountNumber: '',
    ifscCode: '',
    bankName: '',
  })
  const [upiDetails, setUpiDetails] = useState({
    upiId: '',
    upiPhoneNumber: '',
  })
  const [qrCode, setQrCode] = useState(null)
  const [qrCodePreview, setQrCodePreview] = useState(null)
  const qrCodeInputRef = useRef(null)

  const handleAddPincode = () => {
    if (pincode && !pincodes.includes(pincode)) {
      setPincodes([...pincodes, pincode])
      setPincode('')
    }
  }

  const handleRemovePincode = (code) => {
    setPincodes(pincodes.filter((p) => p !== code))
  }

  const showError = (message) => {
    setModalMessage(message)
    setShowErrorModal(true)
  }

  useEffect(() => {
    if (window.google && window.google.maps && window.google.maps.places) {
      setGoogleMapsLoaded(true)
      return
    }

    const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY

    const script = document.createElement('script')
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places`
    script.async = true
    script.defer = true

    script.onload = () => {
      setGoogleMapsLoaded(true)
    }

    script.onerror = () => {
      console.error('Failed to load Google Maps API')
      showError('Failed to load Google Maps. Address autocomplete will not be available.')
    }

    document.head.appendChild(script)

    return () => {
      const existingScript = document.querySelector(`script[src*="maps.googleapis.com"]`)
      if (existingScript) {
        document.head.removeChild(existingScript)
      }
    }
  }, [])

  const handlePlaceSelect = async (place) => {
    if (!place) return
    setBusinessAddress(place)
    try {
      const results = await geocodeByAddress(place.label)
      const latLng = await getLatLng(results[0])
      setLatitude(latLng.lat)
      setLongitude(latLng.lng)

      const postalCode =
        results[0].address_components.find((c) => c.types.includes('postal_code'))?.long_name || ''
      setBusinessPincode(postalCode)
      setLocationStatus(`✅ Address selected: ${place.label}`)
    } catch (error) {
      console.error('Error selecting place:', error)
      showError('Could not get details for the selected address.')
    }
  }

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axiosInstance.get('/category')
        if (response.data && response.data.categories) {
          setCategories(response.data.categories)
        }
      } catch (error) {
        console.error('Failed to fetch categories', error)
        showError('Could not load business categories. Please try again later.')
      }
    }

    fetchCategories()
  }, [])

  useEffect(() => {
    if (!showCameraModal && cameraStream) {
      cameraStream.getTracks().forEach((track) => track.stop())
      setCameraStream(null)
      setIsCameraReady(false)
    }
  }, [showCameraModal, cameraStream])

  const handleGetCurrentLocation = () => {
    if (!googleMapsLoaded) {
      showError('Google Maps is not loaded yet. Please wait a moment and try again.')
      return
    }
    if (navigator.geolocation) {
      setLocationStatus('Fetching current location...')
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude
          const lng = position.coords.longitude
          setLatitude(lat)
          setLongitude(lng)

          const geocoder = new window.google.maps.Geocoder()
          const latlng = { lat, lng }

          geocoder.geocode({ location: latlng }, (results, status) => {
            if (status === 'OK' && results[0]) {
              const address = results[0].formatted_address
              const postalCodeComponent = results[0].address_components.find((component) =>
                component.types.includes('postal_code'),
              )
              setBusinessAddress({ label: address, value: results[0] })
              if (postalCodeComponent) {
                setBusinessPincode(postalCodeComponent.long_name)
              }

              setLocationStatus(
                `✅ Current location: Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)}`,
              )
            } else {
              setLocationStatus(
                `✅ Location captured: Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(
                  4,
                )}. Please enter address manually.`,
              )
            }
          })
        },
        (error) => {
          console.error('Geolocation error:', error)
          setLocationStatus(`❌ Error: ${error.message}. Please enter address manually.`)
        },
        // --- FIX 2 START: Geolocation options updated for better reliability ---
        // Increased timeout to give the device more time to get a location.
        // Increased maximumAge to allow using a recently cached location,
        // reducing errors on repeated clicks.
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 60000,
        },
        // --- FIX 2 END ---
      )
    } else {
      setLocationStatus('Geolocation is not supported by this browser.')
    }
  }

  const handleFileUpload = async (file, setFile, setPreview) => {
    // <--- ADD async
    if (file) {
      // 2. COMPRESS THE FILE HERE
      const compressedFile = await compressImageFile(file) // <--- NEW COMPRESSION LOGIC

      // If the file is still too large after compression (e.g., a massive PDF), notify the user.
      if (compressedFile.size > 5 * 1024 * 1024) {
        showError(
          'The file size is still greater than 5MB even after compression. Please upload a smaller file.',
        )
        return
      }

      const reader = new FileReader()
      reader.onload = (e) => {
        setPreview(e.target.result)
      }
      reader.readAsDataURL(compressedFile) // Read the compressed file for preview
      setFile(compressedFile) // Set the compressed file
    }
  }

  const handleShopPhotoUpload = async (e) => {
    // <--- ADD async
    const files = Array.from(e.target.files)
    if (files.length > 0) {
      // 3. COMPRESS EACH SHOP PHOTO BEFORE ADDING TO STATE
      const compressedFiles = await Promise.all(files.map((file) => compressImageFile(file)))

      // Filter out files that are still too large (if compression failed or it's a huge non-image file)
      const validFiles = compressedFiles.filter((file) => {
        if (file.size > 5 * 1024 * 1024) {
          showError(
            `File '${file.name}' is still too large (>5MB) even after compression and will be ignored.`,
          )
          return false
        }
        return true
      })

      const newPhotos = [...shopPhotos, ...validFiles]
      setShopPhotos(newPhotos)

      const newPreviews = [...shopPhotoPreviews]
      validFiles.forEach((file) => {
        // Use validFiles for previews
        const reader = new FileReader()
        reader.onload = (e) => {
          newPreviews.push(e.target.result)
          setShopPhotoPreviews(newPreviews)
        }
        reader.readAsDataURL(file)
      })
    }
  }

  const removeShopPhoto = (index) => {
    const newPhotos = [...shopPhotos]
    newPhotos.splice(index, 1)
    setShopPhotos(newPhotos)

    const newPreviews = [...shopPhotoPreviews]
    newPreviews.splice(index, 1)
    setShopPhotoPreviews(newPreviews)
  }

  const handleAadharFrontUpload = (e) => {
    handleFileUpload(e.target.files[0], setAadharFrontDocument, setAadharFrontDocumentPreview)
  }

  const handleAadharBackUpload = (e) => {
    handleFileUpload(e.target.files[0], setAadharBackDocument, setAadharBackDocumentPreview)
  }

  const handlePanCardUpload = (e) => {
    handleFileUpload(e.target.files[0], setPanCardDocument, setPanCardDocumentPreview)
  }

  const handleSelfieUpload = (e) => {
    handleFileUpload(e.target.files[0], setSelfiePhoto, setSelfiePhotoPreview)
  }

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user' },
        audio: false,
      })
      setCameraStream(stream)
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.onloadedmetadata = () => {
          videoRef.current.play()
          setIsCameraReady(true)
        }
      }
    } catch (error) {
      console.error('Error accessing camera:', error)
      showError('Unable to access camera. Please check permissions.')
      setShowCameraModal(false)
    }
  }

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current
      const canvas = canvasRef.current
      const context = canvas.getContext('2d')

      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      context.drawImage(video, 0, 0)

      canvas.toBlob(
        (blob) => {
          const file = new File([blob], 'selfie.jpg', { type: 'image/jpeg' })
          handleFileUpload(file, setSelfiePhoto, setSelfiePhotoPreview)
          setShowCameraModal(false)
        },
        'image/jpeg',
        0.8,
      )
    }
  }

  const openCamera = () => {
    setShowCameraModal(true)
    setTimeout(() => {
      startCamera()
    }, 100)
  }

  const removeImage = (setFile, setPreview) => {
    setFile(null)
    setPreview(null)
  }

  const handleSignUp = async () => {
    if (shopPhotos.length === 0) return showError('Please upload at least one shop photo.')
    if (!name.trim()) return showError('Please enter your name.')
    if (!email.trim()) return showError('Please enter your email.')
    if (!password.trim()) return showError('Please enter a password.')
    if (!businessName.trim()) return showError('Please enter your business name.')
    if (!selectedCategory) return showError('Please select a business category.')
    if (!businessAddress?.label) return showError('Please enter your business address.')
    if (!contactNumber.trim()) return showError('Please enter your contact number.')
    if (!selfiePhoto) return showError('Please take a selfie or upload a photo.')
    if (documentType === 'aadhaar') {
      if (!aadharFrontDocument) {
        return showError('Please upload the front of your Aadhar card.')
      }
      if (!aadharBackDocument) {
        return showError('Please upload the back of your Aadhar card.')
      }
    } else if (documentType === 'pan') {
      if (!panCardDocument) {
        return showError('Please upload your PAN card.')
      }
    }

    setIsLoading(true)
    try {
      const formData = new FormData()
      formData.append('name', name.trim())
      formData.append('password', password.trim())
      formData.append('email', email.trim())
      formData.append(
        'vendorInfo',
        JSON.stringify({
          contactNumber: contactNumber.trim(),
          alternativeContactNumber: alternativeContactNumber.trim(),
          businessName: businessName.trim(),
        }),
      )
      formData.append(
        'location',
        JSON.stringify({
          address: {
            addressLine1: businessAddress.label.trim(),
            addressLine2: alternativeAddress.trim(),
            landmark: landmark.trim(),
            postalCode: businessPincode.trim(),
            postalCodes: pincodes,
          },
          coordinates: latitude && longitude ? [longitude, latitude] : [],
        }),
      )
      formData.append('category', selectedCategory)
      formData.append('bankDetails', JSON.stringify(bankDetails))
      formData.append('upiDetails', JSON.stringify(upiDetails))
      if (qrCode) {
        formData.append('qrCode', qrCode)
      }
      if (businessAddress?.value?.place_id)
        formData.append('placeId', businessAddress.value.place_id)
      shopPhotos.forEach((photo) => {
        formData.append('shopPhoto', photo)
      })
      formData.append('selfiePhoto', selfiePhoto)
      if (documentType === 'aadhaar') {
        formData.append('aadharFrontDocument', aadharFrontDocument)
        formData.append('aadharBackDocument', aadharBackDocument)
      } else if (documentType === 'pan') {
        formData.append('panCardDocument', panCardDocument)
      }

      const response = await axiosInstance.post('/vendors/signup', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })

      if (response.status === 201) {
        setShowSuccessModal(true)
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || error.message || 'An unexpected error occurred.'
      showError(`Registration failed: ${errorMessage}`)
    } finally {
      setIsLoading(false)
    }
  }

  const handleBankDetailsChange = (e) => {
    setBankDetails({ ...bankDetails, [e.target.name]: e.target.value })
  }

  const handleUpiDetailsChange = (e) => {
    setUpiDetails({ ...upiDetails, [e.target.name]: e.target.value })
  }

  const handleQrCodeUpload = (e) => {
    handleFileUpload(e.target.files[0], setQrCode, setQrCodePreview)
  }

  return (
    <div className="bg-body-tertiary min-vh-100 d-flex flex-row align-items-center">
      <CContainer>
        <CRow className="justify-content-center">
          <CCol md={9} lg={7} xl={6}>
            <CCard className="mx-4">
              <CCardBody className="p-4">
                <CForm>
                  <h1>Register</h1>
                  <p className="text-body-secondary">Create your vendor account</p>

                  <CInputGroup className="mb-3">
                    <CInputGroupText>
                      <CIcon icon={cilUser} />
                    </CInputGroupText>
                    <CFormInput
                      placeholder="Full Name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </CInputGroup>

                  <CInputGroup className="mb-3">
                    <CInputGroupText>@</CInputGroupText>
                    <CFormInput
                      type="email"
                      placeholder="Email Address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </CInputGroup>

                  <CInputGroup className="mb-3">
                    <CInputGroupText>
                      <CIcon icon={cilPhone} />
                    </CInputGroupText>
                    <CFormInput
                      placeholder="Contact Number"
                      value={contactNumber}
                      onChange={(e) => setContactNumber(e.target.value)}
                      required
                    />
                  </CInputGroup>

                  <CInputGroup className="mb-3">
                    <CInputGroupText>
                      <CIcon icon={cilPhone} />
                    </CInputGroupText>
                    <CFormInput
                      placeholder="Alternative Contact Number (Optional)"
                      value={alternativeContactNumber}
                      onChange={(e) => setAlternativeContactNumber(e.target.value)}
                    />
                  </CInputGroup>

                  <CInputGroup className="mb-3">
                    <CInputGroupText>
                      <CIcon icon={cilBuilding} />
                    </CInputGroupText>
                    <CFormInput
                      placeholder="Business Name"
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                      required
                    />
                  </CInputGroup>

                  <CInputGroup className="mb-3">
                    <CInputGroupText>
                      <CIcon icon={cilList} />
                    </CInputGroupText>
                    <CFormSelect
                      aria-label="Select business category"
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      required
                    >
                      <option value="">Select your business category</option>
                      {categories.map((category) => (
                        <option key={category._id} value={category._id}>
                          {category.name}
                        </option>
                      ))}
                    </CFormSelect>
                  </CInputGroup>

                  <hr />
                  <p className="text-body-secondary">Business Location</p>

                  <CInputGroup className="mb-3">
                    <CInputGroupText>
                      <CIcon icon={cilLocationPin} />
                    </CInputGroupText>
                    <div style={{ flex: 1 }}>
                      {googleMapsLoaded ? (
                        <GooglePlacesAutocomplete
                          selectProps={{
                            value: businessAddress,
                            onChange: handlePlaceSelect,
                            placeholder: 'Start typing your business address...',
                            // --- FIX 1 START: Style overrides for dropdown visibility ---
                            // These styles ensure that the dropdown text is visible
                            // against the background, fixing the white-on-white issue.
                            styles: {
                              input: (provided) => ({
                                ...provided,
                                width: '100%',
                                padding: '0.375rem 0.75rem',
                                border: 'none',
                                boxShadow: 'none',
                                color: '#212529', // CoreUI dark text color
                              }),
                              option: (provided, state) => ({
                                ...provided,
                                color: state.isFocused ? '#212529' : '#495057', // CoreUI text colors
                                backgroundColor: state.isFocused ? '#f8f9fa' : 'white', // CoreUI background colors
                              }),
                              singleValue: (provided) => ({
                                ...provided,
                                color: '#212529', // Ensure selected value text is visible
                              }),
                              menu: (provided) => ({ ...provided, zIndex: 9999 }),
                            },
                            // --- FIX 1 END ---
                          }}
                          autocompletionRequest={{
                            componentRestrictions: {
                              country: ['in'],
                            },
                          }}
                        />
                      ) : (
                        <CFormInput placeholder="Loading address search..." disabled />
                      )}
                    </div>
                  </CInputGroup>

                  <CInputGroup className="mb-3">
                    <CInputGroupText>
                      <CIcon icon={cilLocationPin} />
                    </CInputGroupText>
                    <CFormInput
                      placeholder="Landmark"
                      value={landmark}
                      onChange={(e) => setLandmark(e.target.value)}
                      autoComplete="off"
                    />
                  </CInputGroup>

                  <CInputGroup className="mb-3">
                    <CInputGroupText>
                      <CIcon icon={cilLocationPin} />
                    </CInputGroupText>
                    <CFormInput
                      placeholder="Alternative Address"
                      value={alternativeAddress}
                      onChange={(e) => setAlternativeAddress(e.target.value)}
                      autoComplete="off"
                    />
                  </CInputGroup>

                  <CInputGroup className="mb-3">
                    <CInputGroupText>
                      <CIcon icon={cilLocationPin} />
                    </CInputGroupText>
                    <CFormInput
                      placeholder="Postal Code / PIN Code"
                      value={businessPincode}
                      onChange={(e) => setBusinessPincode(e.target.value)}
                    />
                  </CInputGroup>
                  <div className="mb-3">
                    <PincodeInput
                      pincode={pincode}
                      setPincode={setPincode}
                      pincodes={pincodes}
                      setPincodes={setPincodes}
                      handleAddPincode={handleAddPincode}
                      handleRemovePincode={handleRemovePincode}
                    />
                  </div>

                  <div className="mb-3">
                    <div className="d-grid d-md-flex justify-content-md-center gap-2">
                      <CButton
                        color="secondary"
                        variant="outline"
                        onClick={handleGetCurrentLocation}
                        disabled={!googleMapsLoaded}
                        className="mb-2 mb-md-0"
                      >
                        📍 Use Current Location
                      </CButton>
                      <CButton
                        color="info"
                        variant="outline"
                        onClick={() => {
                          setLocationStatus('')
                          setBusinessAddress(null)
                          setBusinessPincode('')
                          setLatitude(null)
                          setLongitude(null)
                        }}
                        className="mb-2 mb-md-0"
                      >
                        🔄 Clear Address
                      </CButton>
                    </div>

                    {locationStatus && (
                      <CFormText className="mt-2 d-block text-center">{locationStatus}</CFormText>
                    )}
                  </div>

                  <hr />
                  <p className="text-body-secondary">Bank Account Details</p>
                  <CInputGroup className="mb-3">
                    <CFormInput
                      placeholder="Account Holder Name"
                      name="accountHolderName"
                      value={bankDetails.accountHolderName}
                      onChange={handleBankDetailsChange}
                    />
                  </CInputGroup>
                  <CInputGroup className="mb-3">
                    <CFormInput
                      placeholder="Account Number"
                      name="accountNumber"
                      value={bankDetails.accountNumber}
                      onChange={handleBankDetailsChange}
                    />
                  </CInputGroup>
                  <CInputGroup className="mb-3">
                    <CFormInput
                      placeholder="IFSC Code"
                      name="ifscCode"
                      value={bankDetails.ifscCode}
                      onChange={handleBankDetailsChange}
                    />
                  </CInputGroup>
                  <CInputGroup className="mb-3">
                    <CFormInput
                      placeholder="Bank Name"
                      name="bankName"
                      value={bankDetails.bankName}
                      onChange={handleBankDetailsChange}
                    />
                  </CInputGroup>

                  <hr />
                  <p className="text-body-secondary">UPI Details</p>
                  <CInputGroup className="mb-3">
                    <CFormInput
                      placeholder="UPI ID"
                      name="upiId"
                      value={upiDetails.upiId}
                      onChange={handleUpiDetailsChange}
                    />
                  </CInputGroup>
                  <CInputGroup className="mb-3">
                    <CFormInput
                      placeholder="UPI Phone Number"
                      name="upiPhoneNumber"
                      value={upiDetails.upiPhoneNumber}
                      onChange={handleUpiDetailsChange}
                    />
                  </CInputGroup>

                  <div className="mb-3">
                    <CFormLabel>QR Code</CFormLabel>
                    <CButton
                      color="info"
                      variant="outline"
                      onClick={() => qrCodeInputRef.current?.click()}
                    >
                      <CIcon icon={cilCloudUpload} className="me-2" />
                      Upload QR Code
                    </CButton>
                    <CFormInput
                      type="file"
                      ref={qrCodeInputRef}
                      accept="image/*"
                      onChange={handleQrCodeUpload}
                      style={{ display: 'none' }}
                    />
                    {qrCodePreview && (
                      <div className="mt-2 text-center">
                        <img
                          src={qrCodePreview}
                          alt="QR Code Preview"
                          style={{ maxWidth: '150px', maxHeight: '150px', borderRadius: '5px' }}
                        />
                      </div>
                    )}
                  </div>

                  <hr />
                  <p className="text-body-secondary">Upload Documents & Photos</p>

                  {/* Shop Photo Upload */}
                  <div className="mb-3">
                    <CFormLabel>Shop Photo *</CFormLabel>
                    <div className="d-grid gap-2">
                      <CButton
                        color="primary"
                        variant="outline"
                        onClick={() => shopPhotoInputRef.current?.click()}
                      >
                        <CIcon icon={cilCloudUpload} className="me-2" />
                        Upload Shop Photos
                      </CButton>
                      <CFormInput
                        type="file"
                        ref={shopPhotoInputRef}
                        accept="image/*"
                        onChange={handleShopPhotoUpload}
                        style={{ display: 'none' }}
                        multiple // Allow multiple file selection
                      />
                    </div>
                    <div className="mt-2 d-flex flex-wrap">
                      {shopPhotoPreviews.map((preview, index) => (
                        <div key={index} className="m-1" style={{ position: 'relative' }}>
                          <img
                            src={preview}
                            alt={`Shop preview ${index + 1}`}
                            style={{
                              width: '100px',
                              height: '100px',
                              objectFit: 'cover',
                              borderRadius: '5px',
                            }}
                          />
                          <CButton
                            color="danger"
                            size="sm"
                            onClick={() => removeShopPhoto(index)}
                            style={{ position: 'absolute', top: '0', right: '0' }}
                          >
                            <CIcon icon={cilTrash} />
                          </CButton>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Selfie Photo */}
                  <div className="mb-3">
                    <CFormLabel>Business owner photo *</CFormLabel>
                    <div className="d-grid gap-2">
                      <CButton color="success" variant="outline" onClick={openCamera}>
                        <CIcon icon={cilCamera} className="me-2" />
                        Take Selfie
                      </CButton>
                      <CButton
                        color="info"
                        variant="outline"
                        onClick={() => selfiePhotoInputRef.current?.click()}
                      >
                        <CIcon icon={cilCloudUpload} className="me-2" />
                        Upload Photo
                      </CButton>
                      <CFormInput
                        type="file"
                        ref={selfiePhotoInputRef}
                        accept="image/*"
                        onChange={handleSelfieUpload}
                        style={{ display: 'none' }}
                      />
                    </div>
                    {selfiePhotoPreview && (
                      <div className="mt-2 text-center">
                        <img
                          src={selfiePhotoPreview}
                          alt="Selfie preview"
                          style={{ maxWidth: '150px', maxHeight: '150px', borderRadius: '50%' }}
                        />
                        <div className="mt-1">
                          <CIcon icon={cilCheckCircle} className="text-success me-2" />
                          <small className="text-success">Selfie captured</small>
                          <CButton
                            color="danger"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeImage(setSelfiePhoto, setSelfiePhotoPreview)}
                            className="ms-2"
                          >
                            <CIcon icon={cilTrash} />
                          </CButton>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Document Upload */}
                  <div className="mb-3">
                    <CFormLabel>Document *</CFormLabel>
                    <div>
                      <CFormCheck
                        type="radio"
                        name="documentType"
                        id="aadhaarRadio"
                        label="Aadhaar Card"
                        value="aadhaar"
                        checked={documentType === 'aadhaar'}
                        onChange={() => setDocumentType('aadhaar')}
                      />
                      <CFormCheck
                        type="radio"
                        name="documentType"
                        id="panRadio"
                        label="PAN Card"
                        value="pan"
                        checked={documentType === 'pan'}
                        onChange={() => setDocumentType('pan')}
                      />
                    </div>
                  </div>

                  {documentType === 'aadhaar' && (
                    <div className="mb-3">
                      <CFormLabel>Aadhaar Card *</CFormLabel>
                      <div className="d-grid gap-2">
                        <CButton
                          color="info"
                          variant="outline"
                          onClick={() => aadharFrontInputRef.current?.click()}
                        >
                          <CIcon icon={cilCloudUpload} className="me-2" />
                          Upload Front
                        </CButton>
                        <CFormInput
                          type="file"
                          ref={aadharFrontInputRef}
                          accept="image/*,application/pdf"
                          onChange={handleAadharFrontUpload}
                          style={{ display: 'none' }}
                        />
                        <CButton
                          color="info"
                          variant="outline"
                          onClick={() => aadharBackInputRef.current?.click()}
                        >
                          <CIcon icon={cilCloudUpload} className="me-2" />
                          Upload Back
                        </CButton>
                        <CFormInput
                          type="file"
                          ref={aadharBackInputRef}
                          accept="image/*,application/pdf"
                          onChange={handleAadharBackUpload}
                          style={{ display: 'none' }}
                        />
                      </div>
                      <CFormText className="text-muted">
                        Accepted formats: JPG, PNG, PDF (Max: 5MB)
                      </CFormText>
                      {aadharFrontDocumentPreview && (
                        <div className="mt-2 text-center">
                          <img
                            src={aadharFrontDocumentPreview}
                            alt="Aadhar front preview"
                            style={{ maxWidth: '200px', maxHeight: '150px', borderRadius: '5px' }}
                          />
                          <div className="mt-1">
                            <CIcon icon={cilCheckCircle} className="text-success me-2" />
                            <small className="text-success">Aadhar front uploaded</small>
                            <CButton
                              color="danger"
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                removeImage(setAadharFrontDocument, setAadharFrontDocumentPreview)
                              }
                              className="ms-2"
                            >
                              <CIcon icon={cilTrash} />
                            </CButton>
                          </div>
                        </div>
                      )}
                      {aadharBackDocumentPreview && (
                        <div className="mt-2 text-center">
                          <img
                            src={aadharBackDocumentPreview}
                            alt="Aadhar back preview"
                            style={{ maxWidth: '200px', maxHeight: '150px', borderRadius: '5px' }}
                          />
                          <div className="mt-1">
                            <CIcon icon={cilCheckCircle} className="text-success me-2" />
                            <small className="text-success">Aadhar back uploaded</small>
                            <CButton
                              color="danger"
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                removeImage(setAadharBackDocument, setAadharBackDocumentPreview)
                              }
                              className="ms-2"
                            >
                              <CIcon icon={cilTrash} />
                            </CButton>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {documentType === 'pan' && (
                    <div className="mb-3">
                      <CFormLabel>PAN Card *</CFormLabel>
                      <div className="d-grid gap-2">
                        <CButton
                          color="info"
                          variant="outline"
                          onClick={() => panCardInputRef.current?.click()}
                        >
                          <CIcon icon={cilCloudUpload} className="me-2" />
                          Upload PAN Card
                        </CButton>
                        <CFormInput
                          type="file"
                          ref={panCardInputRef}
                          accept="image/*,application/pdf"
                          onChange={handlePanCardUpload}
                          style={{ display: 'none' }}
                        />
                      </div>
                      <CFormText className="text-muted">
                        Accepted formats: JPG, PNG, PDF (Max: 5MB)
                      </CFormText>
                      {panCardDocumentPreview && (
                        <div className="mt-2 text-center">
                          <img
                            src={panCardDocumentPreview}
                            alt="PAN card preview"
                            style={{ maxWidth: '200px', maxHeight: '150px', borderRadius: '5px' }}
                          />
                          <div className="mt-1">
                            <CIcon icon={cilCheckCircle} className="text-success me-2" />
                            <small className="text-success">PAN card uploaded</small>
                            <CButton
                              color="danger"
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                removeImage(setPanCardDocument, setPanCardDocumentPreview)
                              }
                              className="ms-2"
                            >
                              <CIcon icon={cilTrash} />
                            </CButton>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  <hr />

                  <CInputGroup className="mb-3">
                    <CInputGroupText>
                      <CIcon icon={cilLockLocked} />
                    </CInputGroupText>
                    <CFormInput
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                    <CButton
                      type="button"
                      color="secondary"
                      variant="outline"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <CIcon icon={cilEyedropper} />
                      ) : (
                        <CIcon icon={cilShortText} />
                      )}
                    </CButton>
                  </CInputGroup>

                  <div className="d-grid">
                    <CButton color="primary" onClick={handleSignUp} disabled={isLoading}>
                      {isLoading ? (
                        <>
                          <CSpinner size="sm" className="me-2" />
                          Creating Account...
                        </>
                      ) : (
                        'Create Account'
                      )}
                    </CButton>
                  </div>
                </CForm>
              </CCardBody>
            </CCard>
          </CCol>
        </CRow>

        {/* --- MODALS SECTION --- */}

        <CModal visible={showCameraModal} onClose={() => setShowCameraModal(false)} size="lg">
          <CModalHeader>
            <CModalTitle>Take Your Selfie</CModalTitle>
          </CModalHeader>
          <CModalBody className="text-center">
            <video
              ref={videoRef}
              style={{ width: '100%', maxWidth: '400px', borderRadius: '10px' }}
              autoPlay
              muted
            />
            <canvas ref={canvasRef} style={{ display: 'none' }} />
            {!isCameraReady && (
              <div className="mt-3">
                <CSpinner />
                <p className="mt-2">Loading camera...</p>
              </div>
            )}
          </CModalBody>
          <CModalFooter>
            <CButton color="secondary" onClick={() => setShowCameraModal(false)}>
              Cancel
            </CButton>
            <CButton color="primary" onClick={capturePhoto} disabled={!isCameraReady}>
              <CIcon icon={cilCamera} className="me-2" />
              Capture Photo
            </CButton>
          </CModalFooter>
        </CModal>

        <CModal
          visible={showSuccessModal}
          onClose={() => {
            setShowSuccessModal(false)
            navigate('/login')
          }}
        >
          <CModalHeader>
            <CModalTitle>
              <CIcon icon={cilCheckCircle} className="text-success me-2" />
              Registration Successful!
            </CModalTitle>
          </CModalHeader>
          <CModalBody>Your account has been created successfully.</CModalBody>
          <CModalFooter>
            <CButton
              color="primary"
              onClick={() => {
                setShowSuccessModal(false)
                navigate('/login')
              }}
            >
              OK
            </CButton>
          </CModalFooter>
        </CModal>

        <CModal visible={showErrorModal} onClose={() => setShowErrorModal(false)}>
          <CModalHeader>
            <CModalTitle>
              <CIcon icon={cilWarning} className="text-danger me-2" />
              Validation Error
            </CModalTitle>
          </CModalHeader>
          <CModalBody>{modalMessage}</CModalBody>
          <CModalFooter>
            <CButton color="primary" onClick={() => setShowErrorModal(false)}>
              OK
            </CButton>
          </CModalFooter>
        </CModal>
      </CContainer>
    </div>
  )
}

export default Register
