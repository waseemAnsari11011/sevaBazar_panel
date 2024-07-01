// src/redux/rootReducer.js

import { combineReducers } from 'redux';
import changeState from './defaultReducers';
import orderReducer from './getAllOrdersReducer';
import markOrdersViewedReducer from './markOrderViewedReducer';

const rootReducer = combineReducers({
  app: changeState,
  orders:orderReducer,
  // You can add more reducers here
});

export default rootReducer;
