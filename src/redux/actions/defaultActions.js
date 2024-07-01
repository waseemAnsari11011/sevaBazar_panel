// src/redux/actions.js

import { START_LOADING, STOP_LOADING, SET_USER, LOGOUT_USER, SET_IS_AUTHENTICATED, SET_TOKEN, SET_SIDEBAR_SHOW, SET_THEME } from './types';

export const startLoading = () => ({ type: START_LOADING });
export const stopLoading = () => ({ type: STOP_LOADING });
export const setUser = (user) => ({ type: SET_USER, user });
export const logoutUser = () => ({ type: LOGOUT_USER });
export const setIsAuthenticated = (isAuthenticated) => ({ type: SET_IS_AUTHENTICATED, isAuthenticated });
export const setToken = (token) => ({ type: SET_TOKEN, token });
export const setSidebarShow = (sidebarShow) => ({ type: SET_SIDEBAR_SHOW, sidebarShow });
export const setTheme = (theme) => ({ type: SET_THEME, theme });
