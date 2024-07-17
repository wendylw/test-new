import { combineReducers } from 'redux';
import common from './common';
import submission from './submission';
import form from '../containers/Form/redux';
import preview from '../containers/Preview/redux';

export default combineReducers({
  common,
  submission,
  form,
  preview,
});
