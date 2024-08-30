import { combineReducers } from 'redux';
import { connectRouter } from 'connected-react-router';
import business from '../../containers/Business/redux';
import profile from '../../containers/Profile/redux';
import growthbook from '../../../redux/modules/growthbook';
import merchant from '../../../redux/modules/merchant';
import membership from '../../../redux/modules/membership';
import user from '../../../redux/modules/user';
import customer from './customer';
import common from './common';
import app from './app';

const rootReducer = history =>
  combineReducers({
    router: connectRouter(history),
    user,
    profile,
    business,
    customer,
    common,
    merchant,
    growthbook,
    app,
    membership,
  });

export default rootReducer;
