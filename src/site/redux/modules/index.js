import { combineReducers } from 'redux';
import app from './app';
import home from './home';
import collections from './collections';
import entities from './entities';
import search from './search';
import addressList from './addressList';
import filter from './filter';
import orderHistory from '../../order-history/redux';
import address from '../../../redux/modules/address';

const STORAGE_KEY_ROOT_BACKUP = 'ROOT_STATE_BACKUP';

let restoreToken = false;
// return true at most once, because only one component should skip init because of state restoring
export const checkStateRestoreStatus = () => {
  const ret = restoreToken;
  restoreToken = false;
  return ret;
};

// @actions
const actions = {
  // we won't dispatch real action. This is implemented as thunk action only to make it easier to get state.
  backup: () => (dispatch, getState) => {
    const state = getState();
    sessionStorage.setItem(
      STORAGE_KEY_ROOT_BACKUP,
      JSON.stringify({
        url: document.location.href,
        state,
      })
    );
  },
};

// only call restore for the first time for better performance
let restoreCalled = false;
const restore = () => {
  if (restoreCalled) {
    return null;
  }
  restoreCalled = true;
  const backString = sessionStorage.getItem(STORAGE_KEY_ROOT_BACKUP);
  // will remove storage even if the url doesn't match. Imagine a situation:
  // user go to store page and close the window, then open a new window for main site.
  // we won't restore for this case and will not restore in further access.
  sessionStorage.removeItem(STORAGE_KEY_ROOT_BACKUP);
  let backup = null;
  if (backString) {
    try {
      const data = JSON.parse(backString);
      if (data && data.url === document.location.href) {
        backup = data.state;
      }
    } catch {
      backup = null;
    }
  }
  return backup;
};

const appReducer = combineReducers({
  entities,
  app,
  home,
  collections,
  search,
  orderHistory,
  addressList,
  address,
  filter,
});

const rootReducer = (state, action) => {
  const restoredState = restore();
  if (restoredState) {
    restoreToken = true;
    return appReducer(restoredState, action);
  }
  return appReducer(state, action);
};

export const rootActionCreators = actions;
export default rootReducer;
