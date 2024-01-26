import { combineReducers } from 'redux';
import entities from '../../../redux/modules/entities';
import app from './app';
import customer from './customer';
import home from './home';
import claim from './claim';
import user from '../../../redux/modules/user';
import merchant from '../../../redux/modules/merchant';
import claimCashback from '../../containers/ClaimCashback/redux';
import storeRedemption from '../../containers/StoreRedemption/redux';

const rootReducer = combineReducers({
  entities,
  app,
  customer,
  home,
  claim,
  user,
  merchant,
  claimCashback,
  storeRedemption,
});

export default rootReducer;
