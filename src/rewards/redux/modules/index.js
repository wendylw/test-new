import { combineReducers } from 'redux';
import { connectRouter } from 'connected-react-router';
import business from '../../containers/Business/redux';
import profile from '../../containers/Profile/redux';
import completeProfile from '../../containers/CompleteProfile/redux';
import growthbook from '../../../redux/modules/growthbook';
import merchant from '../../../redux/modules/merchant';
import membership from '../../../redux/modules/membership';
import transaction from '../../../redux/modules/transaction';
import user from '../../../redux/modules/user';
import customer from './customer';
import common from './common';
import app from './app';

const rootReducer = history =>
  combineReducers({
    router: connectRouter(history),
    user,
    profile,
    completeProfile,
    business,
    customer,
    common,
    merchant,
    growthbook,
    app,
    membership,
    transaction,
  });

export default rootReducer;
