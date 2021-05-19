import { combineReducers } from 'redux';
import common from './common';
import savedCards from '../containers/SavedCards/redux';
import onlineBanking from '../containers/OnlineBanking/redux';

export default combineReducers({
  common,
  savedCards,
  onlineBanking,
});
