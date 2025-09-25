import React, { useState, useEffect, useRef } from 'react'
import { CForm, CCol, CFormLabel, CFormInput, CButton, CFormText, CInputGroup } from '@coreui/react'
import { useDispatch, useSelector } from 'react-redux'
import { updateVendorAddress } from 'src/api/vendor/updateVendorAddress'
import CIcon from '@coreui/icons-react'
import { cilLocationPin } from '@coreui/icons'
import PincodeInput from '../pages/register/PincodeInput' // Correctly importing the existing component

const UpdateAddress = ({ user }) => {
  const dispatch = useDispatch()
  const addressInputRef = useRef(null)
  const autocompleteRef = useRef(null)

  const [address, setAddress] = useState({
    addressLine1: '',
    addressLine2: '',
    landmark: '',
    postalCode: '',
    postalCodes: [],
  })
  const [latitude, setLatitude] = useState(null)
  const [longitude, setLongitude] = useState(null)
  const [locationStatus, setLocationStatus] = useState('')
  const [googleMapsLoaded, setGoogleMapsLoaded] = useState(false)

  useEffect(() => {
    if (user?.location?.address) {
      setAddress({
        ...address,
        ...user.location.address,
      })
    }
    if (user?.location?.coordinates) {
      setLongitude(user.location.coordinates[0])
      setLatitude(user.location.coordinates[1])
    }
  }, [user])

  useEffect(() => {
    if (window.google?.maps?.places) {
      setGoogleMapsLoaded(true)
      return
    }
    const script = document.createElement('script')
    script.src = `https://maps.googleapis.com/maps/api/js?key=${
      import.meta.env.VITE_GOOGLE_MAPS_API_KEY
    }&libraries=places`
    script.async = true
    script.defer = true
    script.onload = () => setGoogleMapsLoaded(true)
    document.head.appendChild(script)
    return () => {
      const existingScript = document.querySelector(`script[src*="maps.googleapis.com"]`)
      if (existingScript) {
        document.head.removeChild(existingScript)
      }
    }
  }, [])

  useEffect(() => {
    if (googleMapsLoaded && addressInputRef.current && !autocompleteRef.current) {
      const autocomplete = new window.google.maps.places.Autocomplete(addressInputRef.current, {
        types: ['address'],
        componentRestrictions: { country: 'in' },
        fields: ['address_components', 'formatted_address', 'geometry'],
      })

      autocomplete.addListener('place_changed', () => {
        const place = autocomplete.getPlace()
        if (place.geometry && place.address_components) {
          const postalCodeComponent = place.address_components.find((c) =>
            c.types.includes('postal_code'),
          )
          setAddress((prev) => ({
            ...prev,
            addressLine1: place.formatted_address || '',
            postalCode: postalCodeComponent ? postalCodeComponent.long_name : '',
          }))
          setLatitude(place.geometry.location.lat())
          setLongitude(place.geometry.location.lng())
        }
      })
      autocompleteRef.current = autocomplete
    }
  }, [googleMapsLoaded])

  const handleChange = (e) => {
    const { name, value } = e.target
    setAddress({ ...address, [name]: value })
  }

  const handleGetCurrentLocation = () => {
    if (navigator.geolocation) {
      setLocationStatus('Fetching current location...')
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords
          setLatitude(latitude)
          setLongitude(longitude)

          if (googleMapsLoaded) {
            const geocoder = new window.google.maps.Geocoder()
            geocoder.geocode({ location: { lat: latitude, lng: longitude } }, (results, status) => {
              if (status === 'OK' && results[0]) {
                const postalCodeComponent = results[0].address_components.find((c) =>
                  c.types.includes('postal_code'),
                )
                setAddress((prev) => ({
                  ...prev,
                  addressLine1: results[0].formatted_address || '',
                  postalCode: postalCodeComponent ? postalCodeComponent.long_name : '',
                }))
                setLocationStatus('✅ Location found!')
              } else {
                setLocationStatus('Could not find address for your location.')
              }
            })
          }
        },
        () => setLocationStatus('Unable to retrieve your location.'),
      )
    } else {
      setLocationStatus('Geolocation is not supported by this browser.')
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const location = {
      address,
      type: 'Point',
      coordinates: [longitude, latitude],
    }
    dispatch(updateVendorAddress(user._id, { location }))
  }

  return (
    <CForm className="row g-3" onSubmit={handleSubmit}>
      <CCol md={12}>
        <CFormLabel htmlFor="addressLine1">Address Line 1</CFormLabel>
        <CInputGroup>
          <CFormInput
            ref={addressInputRef}
            id="addressLine1"
            name="addressLine1"
            value={address.addressLine1}
            onChange={handleChange}
            placeholder="Search for your address..."
          />
        </CInputGroup>
      </CCol>

      <CCol md={6}>
        <CFormLabel htmlFor="addressLine2">Address Line 2 / Building</CFormLabel>
        <CFormInput
          id="addressLine2"
          name="addressLine2"
          value={address.addressLine2}
          onChange={handleChange}
        />
      </CCol>
      <CCol md={6}>
        <CFormLabel htmlFor="landmark">Landmark</CFormLabel>
        <CFormInput
          id="landmark"
          name="landmark"
          value={address.landmark}
          onChange={handleChange}
        />
      </CCol>
      <CCol md={6}>
        <CFormLabel htmlFor="postalCode">Postal Code</CFormLabel>
        <CFormInput
          id="postalCode"
          name="postalCode"
          value={address.postalCode}
          onChange={handleChange}
        />
      </CCol>

      <CCol md={12}>
        <PincodeInput
          pincodes={address.postalCodes || []}
          setPincodes={(newPincodes) => setAddress({ ...address, postalCodes: newPincodes })}
        />
      </CCol>

      <CCol xs={12}>
        <CButton color="secondary" onClick={handleGetCurrentLocation} className="me-2">
          <CIcon icon={cilLocationPin} className="me-2" /> Use Current Location
        </CButton>
        {locationStatus && <CFormText className="ms-2">{locationStatus}</CFormText>}
      </CCol>

      <CCol xs={12}>
        <CButton color="primary" type="submit">
          Update Address
        </CButton>
      </CCol>
    </CForm>
  )
}

export default UpdateAddress
