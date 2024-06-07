import { legacy_createStore as createStore } from 'redux';

const initialState = {
  sidebarShow: true,
  theme: 'light',
  isAuthenticated: localStorage.getItem('isAuthenticated') === 'true', // Retrieve from localStorage,
  loading: false,
  user: JSON.parse(localStorage.getItem('user')) || {}, // Retrieve user details from localStorage
  token: localStorage.getItem('token')
};

// Define action types
const START_LOADING = 'START_LOADING';
const STOP_LOADING = 'STOP_LOADING';
const SET_USER = 'SET_USER';
const LOGOUT_USER = 'LOGOUT_USER';

// Define reducer function
const changeState = (state = initialState, { type, ...rest }) => {
  switch (type) {
    case 'set':
      return { ...state, ...rest };
    case 'setIsAuthenticated':
      // Save isAuthenticated to localStorage
      localStorage.setItem('isAuthenticated', rest.isAuthenticated);
      return { ...state, isAuthenticated: rest.isAuthenticated };
    case 'setToken':
      // Save isAuthenticated to localStorage
      localStorage.setItem('token', rest.token);
      return { ...state, token: rest.token };
    case START_LOADING:
      return { ...state, loading: true }; // Set loading to true
    case STOP_LOADING:
      return { ...state, loading: false }; // Set loading to false
    case SET_USER:
      // Save user details to localStorage
      localStorage.setItem('user', JSON.stringify(rest.user));
      localStorage.setItem('token', JSON.stringify(rest.user));
      return { ...state, user: rest.user };
    case LOGOUT_USER:
      // Remove user details from localStorage
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.setItem('isAuthenticated', 'false');
      return { ...state, user: {}, isAuthenticated: false };
    default:
      return state;
  }
}

// Action creators
export const startLoading = () => ({ type: START_LOADING });
export const stopLoading = () => ({ type: STOP_LOADING });
export const setUser = (user) => ({ type: SET_USER, user });
export const logoutUser = () => ({ type: LOGOUT_USER });

const store = createStore(changeState);
export default store;
