import { combineReducers } from 'redux';
import { connectRouter } from 'connected-react-router';
import business from '../../containers/Business/redux';
import growthbook from '../../../redux/modules/growthbook';
import user from '../../../redux/modules/user';
import merchant from './merchant';
import customer from './customer';
import app from './app';

const rootReducer = history =>
  combineReducers({
    router: connectRouter(history),
    user,
    business,
    merchant,
    customer,
    growthbook,
    app,
  });

export default rootReducer;
