import { combineReducers } from 'redux';
import app from './app';
import home from './home';
import collections from './collections';
import entities from './entities';
import search from './search';

// @actions
const types = {
  ROOT_BACKUP: 'SITE/ROOT/ROOT_BACKUP',
  ROOT_RESTORE: 'SITE/ROOT/ROOT_RESTORE',
};

const actions = {
  backup: () => ({ type: types.ROOT_BACKUP }),
  restore: () => dispatch => {
    const STORAGE_KEY_ROOT_BACKUP = 'STORAGE_KEY_ROOT_BACKUP';
    const backString = sessionStorage.getItem(STORAGE_KEY_ROOT_BACKUP);
    sessionStorage.removeItem(STORAGE_KEY_ROOT_BACKUP);
    let backup = null;
    if (backString) {
      try {
        backup = JSON.parse(backString);
      } catch {
        backup = null;
      }
    }
    if (backup) {
      dispatch({ type: types.ROOT_RESTORE, payload: backup });
      return true;
    }
    return false;
  },
};

const appReducer = combineReducers({
  entities,
  app,
  home,
  collections,
  search,
});

const rootReducer = (state, action) => {
  const STORAGE_KEY_ROOT_BACKUP = 'STORAGE_KEY_ROOT_BACKUP';

  if (action.type === types.ROOT_BACKUP) {
    sessionStorage.setItem(STORAGE_KEY_ROOT_BACKUP, JSON.stringify(state));
    return state;
  } else if (action.type === types.ROOT_RESTORE) {
    return action.payload;
  }

  return appReducer(state, action);
};

export const rootActionCreators = actions;
export default rootReducer;
