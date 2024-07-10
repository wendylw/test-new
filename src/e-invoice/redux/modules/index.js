import { combineReducers } from 'redux';
import { connectRouter } from 'connected-react-router';
import merchant from '../../../redux/modules/merchant';
import common from './common';
import eInvoice from '../../containers/EInvoice/redux';

const rootReducer = history =>
  combineReducers({
    router: connectRouter(history),
    merchant,
    common,
    eInvoice,
  });

export default rootReducer;
