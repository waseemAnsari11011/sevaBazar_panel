// src/components/GenericSearchComponent.js

import React, { useState, useEffect } from 'react'
import { CFormInput } from '@coreui/react'

const SearchComponent = ({ items, searchKey, onFilteredItems }) => {
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    const filteredItems = items.filter((item) =>
      item[searchKey].toLowerCase().includes(searchQuery.toLowerCase())
    )
    onFilteredItems(filteredItems)
  }, [searchQuery, items, searchKey, onFilteredItems])

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value)
  }

  return (
    <div className="mb-4">
      <CFormInput
        type="text"
        placeholder={`Search ${searchKey}`}
        value={searchQuery}
        onChange={handleSearchChange}
      />
    </div>
  )
}

export default SearchComponent
