import { combineReducers } from 'redux';
import { connectRouter } from 'connected-react-router';
import growthbook from '../../../redux/modules/growthbook';
import user from '../../../redux/modules/user';

const rootReducer = history =>
  combineReducers({
    router: connectRouter(history),
    user,
    growthbook,
  });

export default rootReducer;
