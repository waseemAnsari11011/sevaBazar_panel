import axiosInstance from '../../utils/axiosConfig';
import {
    GET_CHAT_ORDERS_REQUEST,
    GET_CHAT_ORDERS_SUCCESS,
    GET_CHAT_ORDERS_FAILURE,
    UPDATE_CHAT_ORDER_REQUEST,
    UPDATE_CHAT_ORDER_SUCCESS,
    UPDATE_CHAT_ORDER_FAILURE,
} from './types';

// Existing actions for fetching chat orders
export const getChatOrdersRequest = () => ({
    type: GET_CHAT_ORDERS_REQUEST,
});

export const getChatOrdersSuccess = (orders) => ({
    type: GET_CHAT_ORDERS_SUCCESS,
    payload: orders,
});

export const getChatOrdersFailure = (error) => ({
    type: GET_CHAT_ORDERS_FAILURE,
    payload: error,
});

export const fetchChatOrdersByVendor = (vendorId) => async (dispatch) => {
    dispatch(getChatOrdersRequest());
    try {
        const response = await axiosInstance.get(`/chat-order/vendor/${vendorId}`);
        dispatch(getChatOrdersSuccess(response.data.data));
    } catch (error) {
        dispatch(getChatOrdersFailure(error.response.data.message));
    }
};

// New actions for updating chat order amount and status
export const updateChatOrderRequest = () => ({
    type: UPDATE_CHAT_ORDER_REQUEST,
});

export const updateChatOrderSuccess = (order) => ({
    type: UPDATE_CHAT_ORDER_SUCCESS,
    payload: order,
});

export const updateChatOrderFailure = (error) => ({
    type: UPDATE_CHAT_ORDER_FAILURE,
    payload: error,
});

export const updateChatOrderAmountAndStatus = (chatOrderId, totalAmount) => async (dispatch) => {
    dispatch(updateChatOrderRequest());
    try {
        const response = await axiosInstance.put('/chat-order-status-amount', { chatOrderId, totalAmount });
        dispatch(updateChatOrderSuccess(response.data.data));
    } catch (error) {
        dispatch(updateChatOrderFailure(error.response.data.message));
    }
};

export const updateChatOrderStatus = (chatOrderId, newStatus) => async (dispatch) => {
    dispatch(updateChatOrderRequest());
    try {
        const response = await axiosInstance.put(`/chat-order/status/${chatOrderId}/vendor/`, {newStatus} );
        dispatch(updateChatOrderSuccess(response.data.data));
    } catch (error) {
        dispatch(updateChatOrderFailure(error.response.data.message));
    }
};

export const updateChatPaymentStatusManually = (orderId, newStatus) => async (dispatch) => {
    console.log("updateChatPaymentStatusManually")
    dispatch(updateChatOrderRequest());
    try {
        const response = await axiosInstance.post(`/chat-verify-payment`, {orderId, newStatus });
        dispatch(updateChatOrderSuccess(response.data.data));
    } catch (error) {
        dispatch(updateChatOrderFailure(error.response.data.message));
    }
};
