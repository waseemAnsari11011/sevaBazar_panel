// src/redux/orderActions.js

import axiosInstance from '../../utils/axiosConfig';
// import axios from 'axios';
import {
    FETCH_VENDOR_ORDERS_REQUEST,
    FETCH_VENDOR_ORDERS_SUCCESS,
    FETCH_VENDOR_ORDERS_FAILURE
} from './types';

export const fetchVendorOrdersRequest = () => ({
    type: FETCH_VENDOR_ORDERS_REQUEST,
});

export const fetchVendorOrdersSuccess = (orders) => ({
    type: FETCH_VENDOR_ORDERS_SUCCESS,
    payload: orders,
});

export const fetchVendorOrdersFailure = (error) => ({
    type: FETCH_VENDOR_ORDERS_FAILURE,
    payload: error,
});

export const fetchVendorOrders = (vendorId) => async (dispatch) => {
    console.log("get orders api called")
    dispatch(fetchVendorOrdersRequest());
    try {
        const response = await axiosInstance.get(`/new-order/vendor/${vendorId}`);
        console.log("get orders api response", response.data)

        const newordersCount = response.data.newOrdersCount;

        dispatch(fetchVendorOrdersSuccess(newordersCount));
    } catch (error) {
        dispatch(fetchVendorOrdersFailure(error.message));
    }
};
