import {
  GET_CHAT_ORDERS_REQUEST,
  GET_CHAT_ORDERS_SUCCESS,
  GET_CHAT_ORDERS_FAILURE,
  UPDATE_CHAT_ORDER_REQUEST,
  UPDATE_CHAT_ORDER_SUCCESS,
  UPDATE_CHAT_ORDER_FAILURE
} from '../actions/types';

const initialState = {
  loading: false,
  orders: [],
  error: null,
  updating: false, // New state to track the update request
  updateError: null, // New state to track update errors
};

const chatOrdersReducer = (state = initialState, action) => {
  switch (action.type) {
    case GET_CHAT_ORDERS_REQUEST:
      return {
        ...state,
        loading: true,
      };
    case GET_CHAT_ORDERS_SUCCESS:
      return {
        ...state,
        loading: false,
        orders: action.payload,
        error: null,
      };
    case GET_CHAT_ORDERS_FAILURE:
      return {
        ...state,
        loading: false,
        orders: [],
        error: action.payload,
      };
    case UPDATE_CHAT_ORDER_REQUEST:
      return {
        ...state,
        updating: true,
        updateError: null,
      };
    case UPDATE_CHAT_ORDER_FAILURE:
      return {
        ...state,
        updating: false,
        updateError: action.payload,
      };
    default:
      return state;
  }
};

export default chatOrdersReducer;
