// src/components/Categories.js

import React, { useCallback, useState, useEffect } from 'react'
import {
  CButton,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CForm,
  CFormInput,
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
  CSpinner,
} from '@coreui/react'
import { useDropzone } from 'react-dropzone'
import CIcon from '@coreui/icons-react'
import { cilPencil, cilTrash, cilCloudUpload } from '@coreui/icons'
import '../Products.css' // Import custom CSS file
import axiosInstance, { baseURL } from '../../../utils/axiosConfig'
import getCategoryById from '../../../api/category/categoryapi'
import updateCategory from '../../../api/category/updateCategory'
import deleteCategory from '../../../api/category/deleteCategory'
import { useDispatch, useSelector } from 'react-redux'
// import { startLoading, stopLoading } from '../../../store'

import SearchComponent from '../../components/Search'
import { startLoading, stopLoading  } from '../../../redux/actions/defaultActions'
const token = localStorage.getItem('token');

const Categories = () => {
  const user = useSelector(state => state.app.user);
  const userRole = user ? user.role : null;
  const dispatch = useDispatch()
  const isLoading = useSelector((state) => state.app.loading)
  const [categories, setCategories] = useState([])
  const [filteredCategories, setFilteredCategories] = useState([])
  const [modal, setModal] = useState(false)
  const [editingCategory, setEditingCategory] = useState(null)
  const [form, setForm] = useState({ name: '', images: [] })

  useEffect(() => {
    fetchCategories(token)
  }, [])

  const toggleModal = () => {
    if (editingCategory !== null) {
      setForm({ name: '', images: [] })
      setEditingCategory(null)
    }
    setModal(!modal)
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm({ ...form, [name]: value })
  }

  const handleSubmit = async (categoryId) => {
    try {
      dispatch(startLoading())
      if (editingCategory !== null) {
        const updatedcategories = categories.map((category, index) =>
          index === editingCategory ? form : category,
        )
        await updateCategory(categoryId, form)
        await fetchCategories()
        dispatch(stopLoading())
      } else {
        await saveToDb()
        dispatch(stopLoading())
      }
      setForm({ name: '', images: [] })
      setEditingCategory(null)
      toggleModal()
    } catch (error) {
      dispatch(stopLoading())
      console.log('error', error)
    }
  }

  const handleDelete = async (id) => {
    try {
      await deleteCategory(id)
      fetchCategories()
    } catch (error) {
      console.error('Failed to delete category:', error)
    }
  }

  const onDrop = useCallback(
    (acceptedFiles) => {
      setForm({ ...form, images: form.images.concat(acceptedFiles) })
    },
    [form],
  )

  const { getRootProps, getInputProps } = useDropzone({ onDrop })

  const removeImage = (index) => {
    setForm({
      ...form,
      images: form.images.filter((_, i) => i !== index),
    })
  }

  const saveToDb = async () => {
    dispatch(startLoading())
    const formData = new FormData()
    formData.append('name', form.name)
    form.images.forEach((image) => {
      formData.append('images', image)
    })

    try {
      const response = await axiosInstance.post('category', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      await fetchCategories()
      dispatch(stopLoading())
    } catch (error) {
      dispatch(stopLoading())
      console.error(error)
    }
  }

  const fetchCategories = async () => {
    try {
      dispatch(startLoading())
      const response = await axiosInstance.get('/category', {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    });// Adjust the URL as necessary
      if (response.status === 200) {
        setCategories(response.data.categories)
        setFilteredCategories(response.data.categories)
        dispatch(stopLoading())
      }
    } catch (error) {
      dispatch(stopLoading())
      console.error('Failed to fetch categories', error)
    }
  }

  const handleEdit = async (index, id) => {
    let singCategory = await fetchCategoryById(id)
    setEditingCategory(index)
    setForm(singCategory.category)
    toggleModal()
  }

  const fetchCategoryById = async (categoryId) => {
    try {
      const data = await getCategoryById(categoryId)
      return data
    } catch (error) {
      console.error('Error fetching category:', error)
    }
  }

  console.log("userRole---->>>", userRole)
  return (
    <div>
      <h2>Manage Product Categories</h2>
     {userRole === 'admin' && <div className="mb-4">
        <CButton color="primary" onClick={toggleModal}>
          Add Category
        </CButton>
      </div>}
      <SearchComponent
        items={categories}
        searchKey="name"
        onFilteredItems={setFilteredCategories}
      />
      {isLoading ? (
        <div className="spinner-container">
          <CSpinner size="sm" color="blue" />
        </div>
      ) : (
        <CTable striped>
          <CTableHead>
            <CTableRow>
              <CTableHeaderCell>Category Photo</CTableHeaderCell>
              <CTableHeaderCell>Category Name</CTableHeaderCell>
             { userRole === 'admin' && <CTableHeaderCell>Actions</CTableHeaderCell>}
            </CTableRow>
          </CTableHead>
          <CTableBody>
            {filteredCategories?.map((category, index) => (
              <CTableRow key={index}>
                <CTableDataCell>
                  {category.images.map((file, imgIndex) => (
                    <img
                      key={imgIndex}
                      src={`${baseURL}/${file}`}
                      alt={`Category Image ${imgIndex + 1}`}
                      className="table-img"
                    />
                  ))}
                </CTableDataCell>
                <CTableDataCell>{category?.name}</CTableDataCell>
                {userRole === 'admin' &&<CTableDataCell>
                  <div className="actions-cell">
                    <CButton color="warning" onClick={() => handleEdit(index, category?._id)}>
                      <CIcon icon={cilPencil} />
                    </CButton>{' '}
                    <CButton color="danger" onClick={() => handleDelete(category?._id)}>
                      <CIcon icon={cilTrash} />
                    </CButton>
                  </div>
                </CTableDataCell>}
              </CTableRow>
            ))}
          </CTableBody>
        </CTable>
      )}

      <CModal visible={modal} onClose={toggleModal}>
        <CModalHeader>
          <CModalTitle>{editingCategory !== null ? 'Edit Category' : 'Add Category'}</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CForm>
            <CFormInput
              name="name"
              label="Category Name"
              value={form.name}
              onChange={handleChange}
            />
            <div {...getRootProps()} className="upload-container">
              <input {...getInputProps()} />
              <CButton color="primary" variant="outline">
                <CIcon icon={cilCloudUpload} size="lg" className="me-2" />
                Upload Images
              </CButton>
            </div>
            <div className="actions-cell">
              {form?.images?.map((file, index) => (
                <div key={index} className="image-wrapper">
                  <img
                    className="img"
                    src={
                      typeof file === 'string' ? `${baseURL}/${file}` : URL.createObjectURL(file)
                    }
                    alt={`Category Image ${index + 1}`}
                  />
                  <button type="button" className="close-button" onClick={() => removeImage(index)}>
                    ✖
                  </button>
                </div>
              ))}
            </div>
          </CForm>
        </CModalBody>
        <CModalFooter>
          {isLoading ? (
            <CButton color="primary">
              {editingCategory !== null ? 'Updating Category' : 'Creating Category'}{' '}
              <CSpinner size="sm" color="white" />
            </CButton>
          ) : (
            <CButton color="primary" onClick={() => handleSubmit(form._id)}>
              {editingCategory !== null ? 'Save Changes' : 'Add Category'}
            </CButton>
          )}
        </CModalFooter>
      </CModal>
    </div>
  )
}

export default Categories
