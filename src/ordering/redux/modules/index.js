import { combineReducers } from 'redux';
import entities from '../../../redux/modules/entities';
import app from './app';
import home from '../../containers/Home/redux/index';
import cart from '../../containers/shopping-cart/redux';
import promotion from './promotion';
import payments from '../../containers/payments/redux';
import customer from '../../containers/Customer/redux';
import locationAndDate from './locationAndDate';
import orderStatus from '../../containers/order-status/redux';

const rootReducer = combineReducers({
  entities,
  app,
  home,
  cart,
  customer,
  payments,
  promotion,
  locationAndDate,
  orderStatus,
});

export default rootReducer;
