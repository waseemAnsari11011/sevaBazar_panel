// src/redux/chatOrderCountReducer.js

import {
    FETCH_NEW_CHAT_ORDERS_REQUEST,
    FETCH_NEW_CHAT_ORDERS_SUCCESS,
    FETCH_NEW_CHAT_ORDERS_FAILURE
} from '../actions/types';

const initialState = {
    loading: false,
    newChatOrderCount: 0,
    error: ''
};

const chatOrderCountReducer = (state = initialState, action) => {
    switch (action.type) {
        case FETCH_NEW_CHAT_ORDERS_REQUEST:
            return {
                ...state,
                loading: true
            };
        case FETCH_NEW_CHAT_ORDERS_SUCCESS:
            return {
                ...state,
                loading: false,
                newChatOrderCount: action.payload,
                error: ''
            };
        case FETCH_NEW_CHAT_ORDERS_FAILURE:
            return {
                ...state,
                loading: false,
                newChatOrderCount: [],
                error: action.payload
            };
        default:
            return state;
    }
};

export default chatOrderCountReducer;
