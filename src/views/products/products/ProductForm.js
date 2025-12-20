import React, { useState, useEffect, useCallback } from 'react'
import {
  CButton,
  CForm,
  CFormInput,
  CFormSelect,
  CSpinner,
  CAlert,
  CFormSwitch,
  CCard,
  CCardBody,
  CCardHeader,
} from '@coreui/react'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate, useParams } from 'react-router-dom'

// API Imports
import getProductById from '../../../api/product/getSingleProduct'
import createProduct from '../../../api/product/createProduct'
import updateProductDetails from '../../../api/product/updateProductDetails'
import updateVariation from '../../../api/product/updateVariation'
import addVariationApi from '../../../api/product/addVariationApi'
import axiosInstance from '../../../utils/axiosConfig'
import deleteVariation from '../../../api/product/deleteVariation'

// Component Imports
import VariationsComponent from './VariationsComponent'
import { Tags } from './tags'
import { startLoading, stopLoading } from '../../../redux/actions/defaultActions'

const ProductForm = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { id } = useParams() // Get product ID from URL if editing
  const isEditMode = !!id

  const isLoading = useSelector((state) => state.app.loading)
  const user = useSelector((state) => state.app.user)
  const vendor = user?._id

  // Component State
  const [categories, setCategories] = useState([])
  const [alert, setAlert] = useState({ visible: false, message: '', color: 'success' })

  // Form State
  const [form, setForm] = useState({
    name: '',
    description: '',
    vendorProductCategory: '',
    vendor,
    isReturnAllowed: false,
    isVisible: true,
    isOffered: false,
  })
  const [variations, setVariations] = useState([
    { attributes: [{ name: '', value: '' }], price: '', discount: '', quantity: '', images: [] },
  ])
  const [initialVariations, setInitialVariations] = useState([]) // For tracking changes in Edit mode
  const [tags, setTags] = useState([])

  // Fetch Categories
  useEffect(() => {
    if (!vendor) return
    const fetchCategories = async () => {
      try {
        const categoriesResponse = await axiosInstance.get(
          `/vendor-product-category/vendor/${vendor}`,
        )
        setCategories(categoriesResponse.data.categories)
      } catch (error) {
        console.error('Failed to fetch categories:', error)
      }
    }
    fetchCategories()
  }, [vendor])

  // Fetch Product Data if Edit Mode
  useEffect(() => {
    if (isEditMode) {
      const fetchProductData = async () => {
        dispatch(startLoading())
        try {
          const { product } = await getProductById(id)
          setForm({
            name: product.name,
            description: product.description,
            vendorProductCategory: product.vendorProductCategory?._id || '',
            vendor: product.vendor,
            isReturnAllowed: product.isReturnAllowed,
            isVisible: product.isVisible,
            isOffered: product.isOffered,
          })
          setTags(product.tags)

          const formattedVariations = product.variations.map((v) => ({
            ...v,
            attributes:
              v.attributes && v.attributes.length > 0 ? v.attributes : [{ name: '', value: '' }],
          }))

          setVariations(formattedVariations)
          setInitialVariations(formattedVariations)
        } catch (error) {
          console.error('Failed to fetch product details:', error)
          setAlert({ visible: true, message: 'Could not fetch product details.', color: 'danger' })
        } finally {
          dispatch(stopLoading())
        }
      }
      fetchProductData()
    }
  }, [id, isEditMode, dispatch])

  // Handle Form Changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
  }

  // Handle Form Submission
  const handleSubmit = async () => {
    dispatch(startLoading())
    try {
      if (isEditMode) {
        // --- UPDATE LOGIC ---
        await updateProductDetails(id, { ...form, tags })

        const initialVarIds = new Set(initialVariations.map((v) => v._id))
        const addedVariations = variations.filter((v) => !v._id)
        const updatedVariations = variations.filter((v) => v._id && initialVarIds.has(v._id))

        // Identify deleted variations
        const currentVarIds = new Set(variations.map((v) => v._id).filter(Boolean))
        const deletedVariations = initialVariations.filter((v) => !currentVarIds.has(v._id))

        const promises = [
          ...addedVariations.map((v) => addVariationApi(id, v)),
          ...updatedVariations.map((v) => updateVariation(id, v._id, v)),
          ...deletedVariations.map((v) => deleteVariation(id, v._id)),
        ]

        await Promise.all(promises)
        setAlert({ visible: true, message: 'Product updated successfully!', color: 'success' })
      } else {
        // --- CREATE LOGIC ---
        const productData = { ...form, variations, tags, vendor } // Ensure vendor is included
        await createProduct(productData)
        setAlert({ visible: true, message: 'Product created successfully!', color: 'success' })
      }

      // Navigate back after short delay to show success message
      setTimeout(() => {
        navigate('/products/products-create')
      }, 1500)
    } catch (error) {
      console.error('Form submission error:', error)
      const errorMessage = error.response?.data?.message || 'An error occurred. Please try again.'
      setAlert({ visible: true, message: errorMessage, color: 'danger' })
    } finally {
      dispatch(stopLoading())
    }
  }

  return (
    <div>
      {alert.visible && (
        <CAlert
          color={alert.color}
          dismissible
          onClose={() => setAlert({ ...alert, visible: false })}
        >
          {alert.message}
        </CAlert>
      )}

      <CCard>
        <CCardHeader>
          <h3>{isEditMode ? 'Edit Product' : 'Add New Product'}</h3>
        </CCardHeader>
        <CCardBody>
          <CForm>
            <CFormInput
              className="mb-3"
              label="Product Name"
              name="name"
              value={form.name || ''}
              onChange={handleChange}
            />
            <CFormInput
              className="mb-3"
              label="Product Description"
              name="description"
              as="textarea"
              rows={3}
              value={form.description || ''}
              onChange={handleChange}
            />
            <CFormSelect
              className="mb-3"
              label="Product Category"
              name="vendorProductCategory"
              value={form.vendorProductCategory || ''}
              onChange={handleChange}
            >
              <option value="">Select Category</option>
              {categories.map((cat) => (
                <option key={cat._id} value={cat._id}>
                  {cat.name}
                </option>
              ))}
            </CFormSelect>
            <Tags tags={tags} setTags={setTags} />
            
            <CFormSwitch
              className="my-3"
              label="Hand-to-Hand Return Allowed"
              name="isReturnAllowed"
              checked={form.isReturnAllowed || false}
              onChange={handleChange}
            />
            <CFormSwitch
              className="mb-3"
              label="Visible to Customers"
              name="isVisible"
              checked={form.isVisible || false}
              onChange={handleChange}
            />
            <CFormSwitch
              className="mb-3"
              label="Add to Offers"
              name="isOffered"
              checked={form.isOffered || false}
              onChange={handleChange}
            />
            <VariationsComponent variations={variations} setVariations={setVariations} />

            <div className="d-flex justify-content-end mt-4">
              <CButton color="secondary" className="me-2" onClick={() => navigate('/products/products-create')}>
                Cancel
              </CButton>
              <CButton color="primary" onClick={handleSubmit} disabled={isLoading}>
                {isLoading ? <CSpinner size="sm" /> : isEditMode ? 'Save Changes' : 'Add Product'}
              </CButton>
            </div>
          </CForm>
        </CCardBody>
      </CCard>
    </div>
  )
}

export default ProductForm
