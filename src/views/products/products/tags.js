import React, { useState } from 'react'
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
    CFormSelect,
    CSpinner, CBadge, CRow, CCol, CFormCheck,
    CAlert
} from '@coreui/react'

export const Tags = ({ setForm, setTag, setTags, tags, tag , form }) => {
    

    const handleAddTag = () => {
        if (tag && !tags.includes(tag)) {
            setTags([...tags, tag]);
            setTag('');
            setForm({ ...form, tags: [...tags, tag] });

        }
    };

    const handleRemoveTag = (tag) => {
        setTags(tags.filter(p => p !== tag));
        console.log("form.tags?.filter(p => p !== tag)", form)
        setForm({ ...form, tags: form.tags?.filter(p => p !== tag) });
    };


    return (
        <>
         <div style={{ marginTop: '1rem' }}>
         <CRow>
                <CCol xs={8}>
                    <CFormInput
                        type="text"
                        value={tag}
                        onChange={(e) => setTag(e.target.value)}
                        placeholder="Enter tag"
                    // disabled={isAllSelected}
                    />
                </CCol>
                <CCol xs={4}>
                    <CButton color="primary" onClick={handleAddTag} >
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
