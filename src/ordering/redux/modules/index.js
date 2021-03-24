import { combineReducers } from 'redux';
import entities from '../../../redux/modules/entities';
import app from './app';
import home from './home';
import cart from './cart';
import promotion from './promotion';
import payment from './payment';
import payments from '../../containers/Payment/redux';
import thankYou from './thankYou';
import customer from './customer';
import reportDriver from './reportDriver';
import locationAndDate from './locationAndDate';

const rootReducer = combineReducers({
  entities,
  app,
  home,
  cart,
  customer,
  payment,
  payments,
  thankYou,
  promotion,
  reportDriver,
  locationAndDate,
});

export default rootReducer;
