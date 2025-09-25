import React, { useState } from 'react'
import { CFormLabel, CFormInput, CButton, CInputGroup } from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilPlus, cilTrash } from '@coreui/icons'

const PincodeInput = ({ pincodes, setPincodes }) => {
  // 1. Manage the single pincode input state locally
  const [pincode, setPincode] = useState('')

  const handleAddPincode = () => {
    // 2. Check for valid input and if it already exists
    if (pincode && !pincodes.includes(pincode)) {
      // 3. Update the parent component's state
      setPincodes([...pincodes, pincode])
      // 4. Clear the local input field
      setPincode('')
    }
  }

  const handleRemovePincode = (code) => {
    setPincodes(pincodes.filter((p) => p !== code))
  }

  return (
    <div>
      <CFormLabel>Serviceable Pincodes</CFormLabel>
      <CInputGroup className="mb-3">
        <CFormInput
          placeholder="Enter a pincode and click Add"
          value={pincode}
          onChange={(e) => setPincode(e.target.value)}
        />
        <CButton type="button" color="success" onClick={handleAddPincode}>
          <CIcon icon={cilPlus} /> Add
        </CButton>
      </CInputGroup>
      <div>
        {pincodes.map((code) => (
          <span key={code} className="badge bg-secondary me-2 mb-2 p-2">
            {code}
            <CButton
              color="danger"
              size="sm"
              variant="ghost"
              onClick={() => handleRemovePincode(code)}
              className="ms-2 p-0"
            >
              <CIcon icon={cilTrash} />
            </CButton>
          </span>
        ))}
      </div>
    </div>
  )
}

export default PincodeInput
