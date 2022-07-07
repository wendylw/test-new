import { combineReducers } from 'redux';
import common from './common';
import productDetail from './productDetail';
import alcohol from '../components/AlcoholModal/redux';
import cart from './cart';
import promotion from './promotion';
import timeSlot from './timeSlot';

export default combineReducers({
  common,
  productDetail,
  alcohol,
  cart,
  promotion,
  timeSlot,
});
