// src/redux/orderActions.js

import axiosInstance from '../../utils/axiosConfig';
// import axios from 'axios';
import {
   FETCH_NEW_CHAT_ORDERS_REQUEST,
    FETCH_NEW_CHAT_ORDERS_SUCCESS,
    FETCH_NEW_CHAT_ORDERS_FAILURE
} from './types';

export const fetchVendorChatOrdersRequest = () => ({
    type: FETCH_NEW_CHAT_ORDERS_REQUEST,
});

export const fetchVendorChatOrdersSuccess = (orders) => ({
    type: FETCH_NEW_CHAT_ORDERS_SUCCESS,
    payload: orders,
});

export const fetchVendorChatOrdersFailure = (error) => ({
    type: FETCH_NEW_CHAT_ORDERS_FAILURE,
    payload: error,
});

export const fetchVendorChatOrders = (vendorId) => async (dispatch) => {
    console.log("get orders api called")
    dispatch(fetchVendorChatOrdersRequest());
    try {
        const response = await axiosInstance.get(`/new-chat-order/vendor/${vendorId}`);
        console.log("get orders api response", response.data)

        const newordersCount = response.data.newOrdersCount;

        dispatch(fetchVendorChatOrdersSuccess(newordersCount));
    } catch (error) {
        dispatch(fetchVendorChatOrdersFailure(error.message));
    }
};

export const markChatOrdersViewed = (vendorId) => {
    console.log("markOrderViewed is called")

    return async (dispatch) => {
        try {
            const response = await axiosInstance.get(`/mark-viewed/chat-orders/${vendorId}`);
        } catch (error) {
        }
    };
};
