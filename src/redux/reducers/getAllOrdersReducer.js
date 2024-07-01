// src/redux/orderReducer.js

import {
    FETCH_VENDOR_ORDERS_REQUEST,
    FETCH_VENDOR_ORDERS_SUCCESS,
    FETCH_VENDOR_ORDERS_FAILURE
} from '../actions/types';

const initialState = {
    loading: false,
    orders: 0,
    error: ''
};

const orderReducer = (state = initialState, action) => {
    switch (action.type) {
        case FETCH_VENDOR_ORDERS_REQUEST:
            return {
                ...state,
                loading: true
            };
        case FETCH_VENDOR_ORDERS_SUCCESS:
            return {
                ...state,
                loading: false,
                orders: action.payload,
                error: ''
            };
        case FETCH_VENDOR_ORDERS_FAILURE:
            return {
                ...state,
                loading: false,
                orders: [],
                error: action.payload
            };
        default:
            return state;
    }
};

export default orderReducer;
