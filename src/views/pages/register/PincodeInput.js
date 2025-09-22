// PincodeInput.js

import React from 'react'
import { CRow, CCol, CFormInput, CButton, CBadge } from '@coreui/react'

const PincodeInput = ({
  pincode,
  setPincode,
  pincodes,
  setPincodes,
  handleAddPincode,
  handleRemovePincode,
}) => (
  <>
    <CRow>
      <CCol xs={8}>
        <CFormInput
          type="text"
          value={pincode}
          onChange={(e) => setPincode(e.target.value)}
          placeholder="Enter pincode"
        />
      </CCol>
      <CCol xs={4}>
        <CButton color="primary" onClick={handleAddPincode}>
          Add Pincode
        </CButton>
      </CCol>
    </CRow>
    <div style={{ marginTop: '1rem' }}>
      {pincodes.map((code, index) => (
        <CBadge key={index} color="secondary" className="pincode-badge">
          {code}
          <CButton
            color="danger"
            size="sm"
            variant="outline"
            onClick={() => handleRemovePincode(code)}
            style={{ marginLeft: '0.5rem' }}
          >
            &times;
          </CButton>
        </CBadge>
      ))}
    </div>
  </>
)

export default PincodeInput
