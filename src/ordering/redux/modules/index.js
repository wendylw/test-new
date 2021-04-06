import { combineReducers } from 'redux';
import entities from '../../../redux/modules/entities';
import app from './app';
import home from './home';
import cart from './cart';
import promotion from './promotion';
import payment from './payment';
import payments from '../../containers/Payment/redux/payments';
import customer from './customer';
import locationAndDate from './locationAndDate';
import orderStatus from '../../containers/order-status/redux';

const rootReducer = combineReducers({
  entities,
  app,
  home,
  cart,
  customer,
  payment,
  payments,
  promotion,
  locationAndDate,
  orderStatus,
});

export default rootReducer;
