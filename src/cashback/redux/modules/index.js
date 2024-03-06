import { combineReducers } from 'redux';
import entities from '../../../redux/modules/entities';
import app from './app';
import common from './common';
import customer from './customer';
import user from '../../../redux/modules/user';
import merchant from '../../../redux/modules/merchant';
import cashbackHome from '../../containers/Home/redux';
import claimCashback from '../../containers/ClaimCashback/redux';
import storeRedemption from '../../containers/StoreRedemption/redux';

const rootReducer = combineReducers({
  entities,
  app,
  common,
  customer,
  cashbackHome,
  user,
  merchant,
  claimCashback,
  storeRedemption,
});

export default rootReducer;
