import { combineReducers } from 'redux';
import app from './app';
import home from './home';
import entities from './entities';

// @actions

const types = {
  ROOT_BACKUP: 'SITE/ROOT/ROOT_BACKUP',
  ROOT_RESTORE: 'SITE/ROOT/ROOT_RESTORE',
};

const actions = {
  backup: () => ({ type: types.ROOT_BACKUP }),
  restore: () => ({ type: types.ROOT_RESTORE }),
};

const appReducer = combineReducers({
  entities,
  app,
  home,
});

const rootReducer = (state, action) => {
  const STORAGE_KEY_ROOT_BACKUP = 'STORAGE_KEY_ROOT_BACKUP';

  if (action.type === types.ROOT_BACKUP) {
    sessionStorage.setItem(STORAGE_KEY_ROOT_BACKUP, JSON.stringify(state));
    return state;
  } else if (action.type === types.ROOT_RESTORE) {
    try {
      const legacyState = JSON.parse(sessionStorage.getItem(STORAGE_KEY_ROOT_BACKUP));
      sessionStorage.removeItem(STORAGE_KEY_ROOT_BACKUP);
      if (legacyState) {
        return legacyState;
      }
    } catch (e) {
      console.error('STORAGE_KEY_ROOT_BACKUP failure! error =', e);
    }
  }

  return appReducer(state, action);
};

export const rootActionCreators = actions;
export default rootReducer;
