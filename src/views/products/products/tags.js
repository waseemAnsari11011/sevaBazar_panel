// ui/products/tags.js

import React, { useState } from 'react'
import { CButton, CFormInput, CBadge, CRow, CCol } from '@coreui/react'

// ✅ 1. Simplified the props. It only needs the list of tags and the function to update it.
export const Tags = ({ tags, setTags }) => {
  // ✅ 2. Added local state to manage the input field value internally.
  const [inputValue, setInputValue] = useState('')

  const handleAddTag = () => {
    // ✅ 3. Logic now uses the internal 'inputValue' state.
    if (inputValue && !tags.includes(inputValue)) {
      setTags([...tags, inputValue])
      setInputValue('') // Clear the input field after adding.
    }
  }

  const handleRemoveTag = (tagToRemove) => {
    // ✅ 4. Simplified remove function. The parent's state is the single source of truth.
    setTags(tags.filter((tag) => tag !== tagToRemove))
  }

  return (
    <>
      <div style={{ marginTop: '1rem' }}>
        <CRow>
          <CCol xs={8}>
            <CFormInput
              type="text"
              // ✅ 5. Connected the input to the new internal state.
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Enter tag and click Add"
            />
          </CCol>
          <CCol xs={4}>
            <CButton color="primary" onClick={handleAddTag}>
              Add Tag
            </CButton>
          </CCol>
        </CRow>
      </div>

      <div style={{ marginTop: '1rem' }}>
        {tags.map((tag, index) => (
          <CBadge key={index} color="secondary" className="pincode-badge">
            {tag}
            <CButton
              color="danger"
              size="sm"
              variant="outline"
              onClick={() => handleRemoveTag(tag)}
              style={{ marginLeft: '0.5rem' }}
            >
              &times;
            </CButton>
          </CBadge>
        ))}
      </div>
    </>
  )
}
