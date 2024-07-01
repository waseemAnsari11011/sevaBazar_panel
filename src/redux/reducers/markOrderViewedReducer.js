// src/redux/reducers.js

import {
    MARK_ORDERS_VIEWED_REQUEST,
    MARK_ORDERS_VIEWED_SUCCESS,
    MARK_ORDERS_VIEWED_FAILURE
} from '../actions/types';

const initialState = {
    loading: false,
    message: '',
    error: '',
};

const markOrdersViewedReducer = (state = initialState, action) => {
    switch (action.type) {
        case MARK_ORDERS_VIEWED_REQUEST:
            return {
                ...state,
                loading: true,
            };
        case MARK_ORDERS_VIEWED_SUCCESS:
            return {
                ...state,
                loading: false,
                message: action.payload,
                error: '',
            };
        case MARK_ORDERS_VIEWED_FAILURE:
            return {
                ...state,
                loading: false,
                message: '',
                error: action.payload,
            };
        default:
            return state;
    }
};

export default markOrdersViewedReducer;
