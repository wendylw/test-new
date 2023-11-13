import { combineReducers } from 'redux';
import entities from '../../../redux/modules/entities';
import app from './app';
import customer from './customer';
import home from '../../containers/Home/redux';
import claim from '../../containers/Claim/redux';
import storeRedemption from '../../containers/StoreRedemption/redux';

const rootReducer = combineReducers({
  entities,
  app,
  customer,
  home,
  claim,
  storeRedemption,
});

export default rootReducer;
