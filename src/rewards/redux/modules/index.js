import { combineReducers } from 'redux';
import { connectRouter } from 'connected-react-router';
import business from '../../containers/Business/redux';
import growthbook from '../../../redux/modules/growthbook';
import user from '../../../redux/modules/user';

const rootReducer = history =>
  combineReducers({
    router: connectRouter(history),
    user,
    business,
    growthbook,
  });

export default rootReducer;
