// src/redux/rootReducer.js

import { combineReducers } from 'redux';
import changeState from './defaultReducers';
import orderReducer from './getAllOrdersReducer';
import markOrdersViewedReducer from './markOrderViewedReducer';
import chatOrdersReducer from './chatOrdersReducer';

const rootReducer = combineReducers({
  app: changeState,
  orders:orderReducer,
  chatOrders:chatOrdersReducer
  // You can add more reducers here
});

export default rootReducer;
