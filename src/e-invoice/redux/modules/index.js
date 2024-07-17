import { combineReducers } from 'redux';
import { connectRouter } from 'connected-react-router';
import merchant from '../../../redux/modules/merchant';
import common from './common';
import eInvoice from '../../containers/EInvoice/redux';
import consumer from '../../containers/Consumer/redux';
import business from '../../containers/Business/redux';

const rootReducer = history =>
  combineReducers({
    router: connectRouter(history),
    merchant,
    common,
    consumer,
    business,
    eInvoice,
  });

export default rootReducer;
