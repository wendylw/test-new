import { combineReducers } from 'redux';
import common from './common';
import productDetail from './productDetail';
import alcohol from '../components/AlcoholModal/redux';
import cart from './cart';
import promotion from './promotion';
import address from './address';
import timeSlot from './timeSlot';
import stores from './stores';

export default combineReducers({
  common,
  productDetail,
  alcohol,
  cart,
  promotion,
  address,
  timeSlot,
  stores,
});
