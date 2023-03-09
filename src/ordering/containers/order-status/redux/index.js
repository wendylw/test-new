import { combineReducers } from 'redux';
import common from './common';
import thankYou from '../containers/ThankYou/redux';
import reportDriver from '../containers/ReportDriver/redux';
import storeReview from '../containers/StoreReview/redux';
import tableSummary from '../containers/TableSummary/redux';

export default combineReducers({
  common,
  thankYou,
  reportDriver,
  storeReview,
  tableSummary,
});
