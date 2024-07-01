// src/redux/actions.js

import axiosInstance from '../../utils/axiosConfig';
import {
    MARK_ORDERS_VIEWED_REQUEST,
    MARK_ORDERS_VIEWED_SUCCESS,
    MARK_ORDERS_VIEWED_FAILURE
} from './types';

export const markOrdersViewedRequest = () => ({
    type: MARK_ORDERS_VIEWED_REQUEST,
});

export const markOrdersViewedSuccess = (message) => ({
    type: MARK_ORDERS_VIEWED_SUCCESS,
    payload: message,
});

export const markOrdersViewedFailure = (error) => ({
    type: MARK_ORDERS_VIEWED_FAILURE,
    payload: error,
});

export const markOrdersViewed = (vendorId) => {
    console.log("markOrderViewed is called")

    return async (dispatch) => {
        dispatch(markOrdersViewedRequest());
        try {
            const response = await axiosInstance.get(`/mark-viewed/orders/${vendorId}`);
            dispatch(markOrdersViewedSuccess(response.data.message));
        } catch (error) {
            dispatch(markOrdersViewedFailure(error.message));
        }
    };
};
