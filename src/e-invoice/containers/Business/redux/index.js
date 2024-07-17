import { combineReducers } from 'redux';
import submission from './submission';
import form from '../containers/Form/redux';
import preview from '../containers/Preview/redux';

export default combineReducers({
  submission,
  form,
  preview,
});
