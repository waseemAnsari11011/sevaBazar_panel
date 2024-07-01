// src/redux/reducers.js

import { START_LOADING, STOP_LOADING, SET_USER, LOGOUT_USER, SET_IS_AUTHENTICATED, SET_TOKEN, SET_SIDEBAR_SHOW, SET_THEME } from '../actions/types';

const initialState = {
  sidebarShow: true,
  theme: 'light',
  isAuthenticated: localStorage.getItem('isAuthenticated') === 'true',
  loading: false,
  user: JSON.parse(localStorage.getItem('user')) || {},
  token: localStorage.getItem('token')
};

const changeState = (state = initialState, action) => {
  const { type, ...rest } = action;
  switch (type) {
    case SET_SIDEBAR_SHOW:
      return { ...state, sidebarShow: rest.sidebarShow };
    case SET_THEME:
      return { ...state, theme: rest.theme };
    case SET_IS_AUTHENTICATED:
      localStorage.setItem('isAuthenticated', rest.isAuthenticated);
      return { ...state, isAuthenticated: rest.isAuthenticated };
    case SET_TOKEN:
        console.log("setToken is called")
      localStorage.setItem('token', rest.token);
      return { ...state, token: rest.token };
    case START_LOADING:
      return { ...state, loading: true };
    case STOP_LOADING:
      return { ...state, loading: false };
    case SET_USER:
      localStorage.setItem('user', JSON.stringify(rest.user));
      localStorage.setItem('token', rest.user);
      return { ...state, user: rest.user };
    case LOGOUT_USER:
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.setItem('isAuthenticated', 'false');
      return { ...state, user: {}, isAuthenticated: false };
    default:
      return state;
  }
}

export default changeState;
