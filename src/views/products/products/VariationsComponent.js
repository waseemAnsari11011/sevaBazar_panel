import React, { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { CFormCheck, CFormInput, CFormSelect, CButton } from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilCloudUpload } from '@coreui/icons'

// Dropzone component remains the same
const Dropzone = ({ onDrop }) => {
  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: 'image/*',
    multiple: true,
  })

  return (
    <div {...getRootProps()} className="upload-container">
      <input {...getInputProps()} />
      <CButton color="primary" variant="outline">
        <CIcon icon={cilCloudUpload} size="lg" className="me-2" />
        Upload Images
      </CButton>
    </div>
  )
}

const VariationsComponent = ({ variations, setVariations }) => {
  const handleDropVariationImages = useCallback(
    (index, acceptedFiles) => {
      setVariations((prevVariations) =>
        prevVariations.map((variation, i) => {
          if (i === index) {
            return {
              ...variation,
              images: [...(variation.images || []), ...acceptedFiles],
            }
          }
          return variation
        }),
      )
    },
    [setVariations],
  )

  const handleAttributeChange = (index, attribute) => {
    setVariations((prevVariations) =>
      prevVariations.map((variation, i) => {
        if (i === index) {
          return {
            ...variation,
            attributes: { ...variation.attributes, selected: attribute },
          }
        }
        return variation
      }),
    )
  }

  const handleVariationChange = (index, field, subField, value) => {
    setVariations((prevVariations) =>
      prevVariations.map((variation, i) => {
        if (i === index) {
          if (subField) {
            return {
              ...variation,
              [field]: { ...variation[field], [subField]: value },
            }
          }
          return {
            ...variation,
            [field]: value,
          }
        }
        return variation
      }),
    )
  }

  const removeImageVariation = (variationIndex, imageIndex) => {
    setVariations((prevVariations) =>
      prevVariations.map((variation, i) => {
        if (i === variationIndex) {
          return {
            ...variation,
            images: variation.images.filter((_, imgIndex) => imgIndex !== imageIndex),
          }
        }
        return variation
      }),
    )
  }

  const removeVariation = (index) => {
    setVariations((prevVariations) => prevVariations.filter((_, i) => i !== index))
  }

  const addVariation = () => {
    setVariations((prevVariations) => [
      ...prevVariations,
      {
        attributes: { selected: '', value: '' },
        price: '',
        discount: '',
        quantity: '',
        images: [],
        parentVariation: null,
      },
    ])
  }

  return (
    <div className="mt-4">
      <h5 className="mb-3">Product Variations</h5>
      {variations?.map((variation, index) => (
        <div key={index} className="variation-card mb-4 p-3 border rounded">
          <div className="d-flex justify-content-between align-items-center">
            <h6>Variation {index + 1}</h6>
            <CButton
              color="danger"
              variant="outline"
              size="sm"
              onClick={() => removeVariation(index)}
            >
              Remove Variation
            </CButton>
          </div>
          <hr />

          <div className="mb-3">
            <label className="form-label">Attribute Type</label>
            <div>
              <CFormCheck
                inline
                type="radio"
                id={`size-${index}`}
                name={`attribute-${index}`}
                label="Size"
                checked={variation.attributes.selected === 'size'}
                onChange={() => handleAttributeChange(index, 'size')}
              />
              <CFormCheck
                inline
                type="radio"
                id={`color-${index}`}
                name={`attribute-${index}`}
                label="Color"
                checked={variation.attributes.selected === 'color'}
                onChange={() => handleAttributeChange(index, 'color')}
              />
              <CFormCheck
                inline
                type="radio"
                id={`weight-${index}`}
                name={`attribute-${index}`}
                label="Weight"
                checked={variation.attributes.selected === 'weight'}
                onChange={() => handleAttributeChange(index, 'weight')}
              />
              <CFormCheck
                inline
                type="radio"
                id={`packet-${index}`}
                name={`attribute-${index}`}
                label="Packet"
                checked={variation.attributes.selected === 'packet'}
                onChange={() => handleAttributeChange(index, 'packet')}
              />
            </div>
          </div>

          <CFormInput
            className="mb-3"
            name="attributeValue"
            label="Attribute Value"
            placeholder="e.g., 'Large', 'Red', '250g'"
            value={variation.attributes.value}
            onChange={(e) => handleVariationChange(index, 'attributes', 'value', e.target.value)}
          />
          <CFormInput
            className="mb-3"
            type="number"
            name="price"
            label="Price"
            value={variation.price}
            onChange={(e) => handleVariationChange(index, 'price', undefined, e.target.value)}
          />
          <CFormInput
            className="mb-3"
            type="number"
            name="discount"
            label="Discount (%)"
            value={variation.discount}
            onChange={(e) => handleVariationChange(index, 'discount', undefined, e.target.value)}
          />
          <CFormInput
            className="mb-3"
            type="number"
            name="quantity"
            label="Quantity"
            value={variation.quantity}
            onChange={(e) => handleVariationChange(index, 'quantity', undefined, e.target.value)}
          />

          <label className="form-label">Variation Images</label>
          <Dropzone onDrop={(acceptedFiles) => handleDropVariationImages(index, acceptedFiles)} />

          {/* Display uploaded images for this variation */}
          <div className="actions-cell mt-2">
            {variation?.images?.map((file, imgIndex) => (
              <div key={imgIndex} className="image-wrapper">
                {/* ✅ FIX: Use the file string directly if it's a URL, otherwise create an object URL for new files */}
                <img
                  className="img"
                  src={typeof file === 'string' ? file : URL.createObjectURL(file)}
                  alt={`Variation Image ${imgIndex + 1}`}
                />
                <button
                  type="button"
                  className="close-button"
                  onClick={() => removeImageVariation(index, imgIndex)}
                >
                  ✖
                </button>
              </div>
            ))}
          </div>

          <CFormSelect
            className="mt-3"
            name="parentVariation"
            label="Parent Variation"
            value={variation.parentVariation || ''}
            onChange={(e) =>
              handleVariationChange(index, 'parentVariation', undefined, e.target.value)
            }
          >
            <option value="">None</option>
            {variations?.map((v, i) => {
              if (i === index) return null // A variation cannot be its own parent
              return (
                <option key={i} value={v._id}>
                  {`Variation ${i + 1} - ${v.attributes.selected}: ${v.attributes.value}`}
                </option>
              )
            })}
          </CFormSelect>
        </div>
      ))}
      <CButton color="primary" onClick={addVariation}>
        Add Variation
      </CButton>
    </div>
  )
}

export default VariationsComponent
