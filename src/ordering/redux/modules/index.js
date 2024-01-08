import { combineReducers } from 'redux';
import { connectRouter } from 'connected-react-router';
import entities from '../../../redux/modules/entities';
import app from './app';
import profile from '../../containers/Profile/redux/index';
import cart from './cart';
import shoppingCart from '../../containers/shopping-cart/redux';
import promotion from './promotion';
import payments from '../../containers/payments/redux';
import customer from '../../containers/Customer/redux';
import addressList from './addressList';
import locations from './locations';
import locationAndDate from './locationAndDate';
import orderStatus from '../../containers/order-status/redux';
import address from '../../../redux/modules/address';
import menu from '../../containers/Menu/redux';
import promoPayLater from '../../containers/Promotion/redux';
import foodCourt from '../../containers/food-court/redux';
import growthbook from '../../../redux/modules/growthbook';
import membership from '../../../redux/modules/membership';
import merchant from '../../../redux/modules/merchant';

const rootReducer = history =>
  combineReducers({
    router: connectRouter(history),
    entities,
    app,
    cart,
    shoppingCart,
    customer,
    payments,
    promotion,
    addressList,
    locations,
    locationAndDate,
    orderStatus,
    profile,
    address,
    menu,
    promoPayLater,
    foodCourt,
    growthbook,
    membership,
    merchant,
  });

export default rootReducer;
