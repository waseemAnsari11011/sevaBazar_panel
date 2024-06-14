import React, { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import PropTypes from 'prop-types';

import SimpleBar from 'simplebar-react';
import 'simplebar-react/dist/simplebar.min.css';

import { CBadge, CNavLink, CSidebarNav } from '@coreui/react';
import { useSelector } from 'react-redux';

export const AppSidebarNav = ({ items }) => {
  const user = useSelector(state => state.user);
  const userRole = user ? user.role : null;
  const [filteredItems, setFilteredItems] = useState([])

  useEffect(() => {
    // Filter out "Vendors" if userRole is 'vendor'
    const filtered = userRole === 'vendor'
      ? filterMenu(items, ['Customers', 'Vendors', 'Customer Inquiries', 'Help Center', 'Contact', 'Support', 'Banner'])
      : items;

    setFilteredItems(filtered)
  }, [userRole])





  function filterMenu(data, namesToExclude) {
    // Helper function to recursively filter items
    function filterItems(items) {
      return items.reduce((acc, item) => {
        // Check if the current item's name is in the list to exclude
        if (!namesToExclude.includes(item.name)) {
          // If the item has sub-items, filter them recursively
          if (item.items) {
            item.items = filterItems(item.items);
          }
          // Add the item to the accumulator if it's not excluded
          acc.push(item);
        }
        return acc;
      }, []);
    }

    return filterItems(data);
  }

  const navLink = (name, icon, badge, indent = false) => {
    return (
      <>
        {icon
          ? icon
          : indent && (
            <span className="nav-icon">
              <span className="nav-icon-bullet"></span>
            </span>
          )}
        {name && name}
        {badge && (
          <CBadge color={badge.color} className="ms-auto">
            {badge.text}
          </CBadge>
        )}
      </>
    )
  };

  const navItem = (item, index, indent = false) => {
    const { component, name, badge, icon, ...rest } = item;
    const Component = component;
    return (
      <Component as="div" key={index}>
        {rest.to || rest.href ? (
          <CNavLink {...(rest.to && { as: NavLink })} {...rest}>
            {navLink(name, icon, badge, indent)}
          </CNavLink>
        ) : (
          navLink(name, icon, badge, indent)
        )}
      </Component>
    )
  };

  const navGroup = (item, index) => {
    const { component, name, icon, items, to, ...rest } = item;
    const Component = component;
    return (
      <Component compact as="div" key={index} toggler={navLink(name, icon)} {...rest}>
        {item.items?.map((item, index) =>
          item.items ? navGroup(item, index) : navItem(item, index, true),
        )}
      </Component>
    )
  };

  return (
    <CSidebarNav as={SimpleBar}>
      {filteredItems &&
        filteredItems.map((item, index) => (item.items ? navGroup(item, index) : navItem(item, index)))}
    </CSidebarNav>
  )
};

AppSidebarNav.propTypes = {
  items: PropTypes.arrayOf(PropTypes.any).isRequired,
};
