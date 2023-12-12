import { combineReducers } from 'redux';
import entities from '../../../redux/modules/entities';
import app from './app';
import home from './home';
import claim from './claim';
import storeRedemption from '../../containers/StoreRedemption/redux';

const rootReducer = combineReducers({
  entities,
  app,
  home,
  claim,
  storeRedemption,
});

export default rootReducer;
