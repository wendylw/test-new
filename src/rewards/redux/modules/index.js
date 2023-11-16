import { combineReducers } from 'redux';
import { connectRouter } from 'connected-react-router';
import growthbook from '../../../redux/modules/growthbook';

const rootReducer = history =>
  combineReducers({
    router: connectRouter(history),
    growthbook,
  });

export default rootReducer;
