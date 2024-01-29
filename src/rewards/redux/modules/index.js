import { combineReducers } from 'redux';
import { connectRouter } from 'connected-react-router';
import business from '../../containers/Business/redux';
import growthbook from '../../../redux/modules/growthbook';
import merchant from '../../../redux/modules/merchant';
import membership from '../../../redux/modules/membership';
import user from '../../../redux/modules/user';
import customer from './customer';
import app from './app';

const rootReducer = history =>
  combineReducers({
    router: connectRouter(history),
    user,
    business,
    customer,
    merchant,
    growthbook,
    app,
    membership,
  });

export default rootReducer;
