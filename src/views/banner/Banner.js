import React, { useCallback, useState, useEffect } from 'react'
import {
  CButton,
  CModal,
  CTable,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
  CForm,
  CFormInput,
  CSpinner,
  CFormSwitch,
} from '@coreui/react'

import CIcon from '@coreui/icons-react'
import { useDropzone } from 'react-dropzone'
import { cilPencil, cilTrash, cilCloudUpload } from '@coreui/icons'
import './Banner.css'
import axiosInstance, { baseURL } from '../../utils/axiosConfig'
import getBannerById from '../../api/banner/bannerapi'
import deleteBanner from '../../api/banner/deleteBanner'
// import getAllBanner from '../../api/banner/getAllBanner'
import updateBanner from '../../api/banner/updateBanner'
import activebannerapi from '../../api/banner/activebannerapi'
import { useDispatch, useSelector } from 'react-redux'
import { startLoading, stopLoading } from '../../store'

const Banner = ({ banner }) => {
  const [visible, setVisible] = useState(false)
  const dispatch = useDispatch()
  const isLoading = useSelector((state) => state.loading)
  const [banners, setBanners] = useState([])
  const [modal, setModal] = useState(false)
  const [editingBanner, setEditingBanner] = useState(null)
  const [form, setForm] = useState({ name: '', images: [] })
  const [isActive, setIsActive] = useState(false);
  const [labelId, setLabelId] = useState('formSwitchCheckDefault');

  console.log("banners--->", banners)

  useEffect(() => {
    fetchBanners()
  }, [])

  const toggleModal = () => {
    if (editingBanner !== null) {
      setForm({ name: '', images: [] })
      setEditingBanner(null)
    }
    setModal(!modal)
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm({ ...form, [name]: value })
  }

  const handleSubmit = async (bannerId) => {
    try {
      dispatch(startLoading())
      if (editingBanner !== null) {
        const updatedCategories = banners.map((banner, index) =>
          index === editingBanner ? form : banner,
        )
        await updateBanner(bannerId, form)
        await fetchBanners()
        dispatch(stopLoading())
      } else {
        await saveToDb()
        dispatch(stopLoading())
      }
      setForm({ name: '', images: [] })
      setEditingBanner(null)
      toggleModal()
      setVisible(false) // Close the popup after successful submission
    } catch (error) {
      dispatch(stopLoading())
      console.log('error', error)
      setVisible(false) // Close the popup even if there is an error
    }
  }

  const getactionapi = async (id, isActive, setLabelId) => {
    try {
      // dispatch(startLoading());
      const response = await activebannerapi(id, isActive);
      console.log(response);
      if (isActive) {
        console.log("true");
        // setLabelId('formSwitchCheckActive');
        // dispatch(stopLoading());
      } else {
        // console.log("false");
        // setLabelId('formSwitchCheckInactive');
      }
    } catch (error) {
      // dispatch(stopLoading());
      console.log('error', error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteBanner(id)
      fetchBanners()
    } catch (error) {
      console.error('Failed to delete banner:', error)
    }
  }

  const onDrop = useCallback(
    (acceptedFiles) => {
      // Update form state with the uploaded images
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
      const response = await axiosInstance.post('banner', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      await fetchBanners()
      dispatch(stopLoading())
    } catch (error) {
      dispatch(stopLoading())
      console.error(error)
    }
  }

  const fetchBanners = async () => {
    try {
      dispatch(startLoading())
      const response = await axiosInstance.get('/banner')
      if (response.status === 200) {
        const fetchedBanners = response.data.banners.map(banner => ({
          ...banner,
          isActive: banner.isActive || false,
        }))
        setBanners(fetchedBanners)
        dispatch(stopLoading())
      }
    } catch (error) {
      dispatch(stopLoading())
      console.error('Failed to fetch banners', error)
    }
  }

  const handleEdit = async (index, id) => {
    let singleBanner = await fetchBannerById(id)
    console.log('single category--->>>', singleBanner)
    setEditingBanner(index)
    // setForm(categories[index]);
    setForm(singleBanner.banner)
    toggleModal()
  }

  const fetchBannerById = async (bannerId) => {
    try {
      const data = await getBannerById(bannerId)
      console.log('Category retrieved successfully:', data)
      return data
      // Handle the retrieved category data as needed
    } catch (error) {
      console.error('Error fetching category:', error)
    }
  }

  const handleSwitchToggle = async (bannerId) => {
    try {
      const updatedBanners = banners.map((banner) =>
        banner._id === bannerId ? { ...banner, isActive: !banner.isActive } : banner
      )
      setBanners(updatedBanners)
      await getactionapi(bannerId, !banners.find(b => b._id === bannerId).isActive)
    } catch (error) {
      console.error('Failed to toggle switch:', error)
    }
  }

  return (
    <div>
      <h2>Manage Product Banners</h2>
      <div className="mb-4">
        <CButton color="primary" onClick={toggleModal}>
          Add Banner
        </CButton>
      </div>
      {isLoading ? (
        <div className="spinner-container">
          <CSpinner size="sm" color="blue" />
        </div>
      ) : (
        <CTable striped>
          <CTableHead>
            <CTableRow>
              <CTableHeaderCell>Banner Photo</CTableHeaderCell>
              <CTableHeaderCell>Banner Name</CTableHeaderCell>
              <CTableHeaderCell>Actions</CTableHeaderCell>
            </CTableRow>
          </CTableHead>
          <CTableBody>
            {banners?.map((banner, index) => (
              <CTableRow key={index}>
                <CTableDataCell>
                  {banner.images.map((file, imgIndex) => (
                    <img
                      key={imgIndex}
                      src={`${baseURL}/${file}`}
                      alt={`Category Image ${imgIndex + 1}`}
                      className="table-img"
                    />
                  ))}
                </CTableDataCell>
                <CTableDataCell>{banner?.name}</CTableDataCell>
                <CTableDataCell>
                  <div className="actions-cell">
                    <CFormSwitch
                      label=""
                      id={`formSwitch-${banner._id}`}
                      checked={banner.isActive}
                      onChange={() => handleSwitchToggle(banner._id)}
                    />
                    <CButton color="warning" onClick={() => handleEdit(index, banner?._id)}>
                      <CIcon icon={cilPencil} />
                    </CButton>{' '}
                    <CButton color="danger" onClick={() => handleDelete(banner?._id)}>
                      <CIcon icon={cilTrash} />
                    </CButton>
                  </div>
                </CTableDataCell>
              </CTableRow>
            ))}
          </CTableBody>
        </CTable>
      )}

      <CModal visible={modal} onClose={toggleModal}>
        <CModalHeader>
          <CModalTitle>{editingBanner !== null ? 'Edit Banner' : 'Add Banner'}</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CForm>
            <CFormInput name="name" label="Banner Name" value={form.name} onChange={handleChange} />
            {/* Dropzone for multi-image upload */}
            <div {...getRootProps()} className="upload-container">
              <input {...getInputProps()} />
              <CButton color="primary" variant="outline">
                <CIcon icon={cilCloudUpload} size="lg" className="me-2" />
                Upload Images
              </CButton>
            </div>
            {/* Display uploaded images */}
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
              {editingBanner !== null ? 'Updating Banner' : 'Creating Banner'}{' '}
              <CSpinner size="sm" color="white" />
            </CButton>
          ) : (
            <CButton color="primary" onClick={() => handleSubmit(form._id)}>
              {editingBanner !== null ? 'Save Changes' : 'Add Banners'}
            </CButton>
          )}
        </CModalFooter>
      </CModal>
    </div>
  )
}

export default Banner
