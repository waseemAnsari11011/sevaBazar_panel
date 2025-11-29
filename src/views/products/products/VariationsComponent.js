// products/VariationsComponent.js

import React, { useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { CFormInput, CButton, CRow, CCol } from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilCloudUpload, cilPlus, cilTrash } from '@coreui/icons'

// Dropzone component remains the same
const Dropzone = ({ onDrop, accept, label }) => {
  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: accept || { 'image/*': [] },
    multiple: true,
  })
  return (
    <div {...getRootProps()} className="upload-container">
      <input {...getInputProps()} />
      <CButton color="primary" variant="outline">
        <CIcon icon={cilCloudUpload} size="lg" className="me-2" />
        {label || 'Upload Images'}
      </CButton>
    </div>
  )
}

const VariationsComponent = ({ variations, setVariations }) => {
  // Handles changes to top-level variation fields like price, quantity
  const handleVariationChange = (index, field, value) => {
    setVariations((prev) => prev.map((v, i) => (i === index ? { ...v, [field]: value } : v)))
  }

  // --- MAJOR CHANGE: Handles changes within the attributes array ---
  const handleAttributeChange = (variationIndex, attributeIndex, field, value) => {
    setVariations((prev) =>
      prev.map((v, vIdx) => {
        if (vIdx !== variationIndex) return v
        const updatedAttributes = v.attributes.map((attr, aIdx) =>
          aIdx === attributeIndex ? { ...attr, [field]: value } : attr,
        )
        return { ...v, attributes: updatedAttributes }
      }),
    )
  }

  // --- NEW: Adds a new attribute pair to a specific variation ---
  const addAttribute = (variationIndex) => {
    setVariations((prev) =>
      prev.map((v, vIdx) =>
        vIdx === variationIndex
          ? { ...v, attributes: [...v.attributes, { name: '', value: '' }] }
          : v,
      ),
    )
  }

  // --- NEW: Removes an attribute pair from a specific variation ---
  const removeAttribute = (variationIndex, attributeIndex) => {
    setVariations((prev) =>
      prev.map((v, vIdx) => {
        if (vIdx !== variationIndex) return v
        const filteredAttributes = v.attributes.filter((_, aIdx) => aIdx !== attributeIndex)
        return { ...v, attributes: filteredAttributes }
      }),
    )
  }

  // Handles adding/removing images (no change needed here)
  const handleDropVariationImages = useCallback(
    (index, acceptedFiles) => {
      setVariations((prev) =>
        prev.map((v, i) => (i === index ? { ...v, images: [...v.images, ...acceptedFiles] } : v)),
      )
    },
    [setVariations],
  )

  const handleDropVariationVideos = useCallback(
    (index, acceptedFiles) => {
      setVariations((prev) =>
        prev.map((v, i) => (i === index ? { ...v, videos: [...(v.videos || []), ...acceptedFiles] } : v)),
      )
    },
    [setVariations],
  )

  const removeVideoVariation = (variationIndex, videoIndex) => {
    setVariations((prev) =>
      prev.map((v, i) =>
        i === variationIndex
          ? { ...v, videos: v.videos.filter((_, vidIdx) => vidIdx !== videoIndex) }
          : v,
      ),
    )
  }

  const removeImageVariation = (variationIndex, imageIndex) => {
    setVariations((prev) =>
      prev.map((v, i) =>
        i === variationIndex
          ? { ...v, images: v.images.filter((_, imgIdx) => imgIdx !== imageIndex) }
          : v,
      ),
    )
  }

  // --- MAJOR CHANGE: Initializes a new variation with an array for attributes ---
  const addVariation = () => {
    setVariations((prev) => [
      ...prev,
      { attributes: [{ name: '', value: '' }], price: '', discount: '', quantity: '', images: [], videos: [] },
    ])
  }

  const removeVariation = (index) => {
    setVariations((prev) => prev.filter((_, i) => i !== index))
  }

  return (
    <div className="mt-4">
      <h5 className="mb-3">Product Variations</h5>
      {variations.map((variation, vIndex) => (
        <div key={vIndex} className="variation-card mb-4 p-3 border rounded">
          <div className="d-flex justify-content-between align-items-center">
            <h6>Variation {vIndex + 1}</h6>
            <CButton
              color="danger"
              variant="outline"
              size="sm"
              onClick={() => removeVariation(vIndex)}
            >
              Remove
            </CButton>
          </div>
          <hr />

          {/* --- MAJOR CHANGE: Map over the attributes array --- */}
          {variation.attributes.map((attr, aIndex) => (
            <CRow key={aIndex} className="align-items-center mb-2">
              <CCol md={5}>
                <CFormInput
                  label={aIndex === 0 ? 'Attribute Name' : ''}
                  placeholder="e.g., Color, Size"
                  value={attr.name || ''}
                  onChange={(e) => handleAttributeChange(vIndex, aIndex, 'name', e.target.value)}
                />
              </CCol>
              <CCol md={5}>
                <CFormInput
                  label={aIndex === 0 ? 'Attribute Value' : ''}
                  placeholder="e.g., Red, Large"
                  value={attr.value || ''}
                  onChange={(e) => handleAttributeChange(vIndex, aIndex, 'value', e.target.value)}
                />
              </CCol>
              <CCol md={2} className="text-end">
                <CButton
                  color="danger"
                  variant="ghost"
                  onClick={() => removeAttribute(vIndex, aIndex)}
                >
                  <CIcon icon={cilTrash} />
                </CButton>
              </CCol>
            </CRow>
          ))}
          <CButton
            color="secondary"
            variant="outline"
            size="sm"
            className="mt-2"
            onClick={() => addAttribute(vIndex)}
          >
            <CIcon icon={cilPlus} className="me-1" /> Add Attribute
          </CButton>
          {/* --- End of Attribute Mapping --- */}
          <hr />

          <CFormInput
            className="mb-3"
            type="number"
            label="Price"
            value={variation.price}
            onChange={(e) => handleVariationChange(vIndex, 'price', e.target.value)}
          />
          <CFormInput
            className="mb-3"
            type="number"
            label="Discount (%)"
            value={variation.discount}
            onChange={(e) => handleVariationChange(vIndex, 'discount', e.target.value)}
          />
          <CFormInput
            className="mb-3"
            type="number"
            label="Quantity"
            value={variation.quantity}
            onChange={(e) => handleVariationChange(vIndex, 'quantity', e.target.value)}
          />
          <label className="form-label">Variation Images</label>
          <Dropzone onDrop={(files) => handleDropVariationImages(vIndex, files)} />
          <div className="actions-cell mt-2">
            {variation.images?.map((file, imgIndex) => (
              <div key={imgIndex} className="image-wrapper">
                <img
                  className="img"
                  src={typeof file === 'string' ? file : URL.createObjectURL(file)}
                  alt={`Variation ${imgIndex + 1}`}
                />
                <button
                  type="button"
                  className="close-button"
                  onClick={() => removeImageVariation(vIndex, imgIndex)}
                >
                  ✖
                </button>
              </div>
            ))}
          </div>


          <label className="form-label mt-3">Variation Videos (Max 2)</label>
          <Dropzone
            onDrop={(files) => handleDropVariationVideos(vIndex, files)}
            accept={{ 'video/*': [] }}
            label="Upload Videos"
          />
          <div className="actions-cell mt-2">
            {variation.videos?.map((file, vidIndex) => (
              <div key={vidIndex} className="image-wrapper" style={{ width: '150px', height: '100px' }}>
                <video
                  className="img"
                  src={typeof file === 'string' ? file : URL.createObjectURL(file)}
                  controls
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <button
                  type="button"
                  className="close-button"
                  onClick={() => removeVideoVariation(vIndex, vidIndex)}
                >
                  ✖
                </button>
              </div>
            ))}
          </div>
        </div>
      ))}
      <CButton color="primary" onClick={addVariation}>
        Add Another Variation
      </CButton>
    </div>
  )
}

export default VariationsComponent
