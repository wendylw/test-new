import { combineReducers } from 'redux';
import entities from '../../../redux/modules/entities';
import app from './app';
import home from './home';
import claim from './claim';

const rootReducer = combineReducers({
	entities,
	app,
	home,
	claim,
});

export default rootReducer;
