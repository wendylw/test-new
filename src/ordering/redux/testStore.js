import { createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import rootReducer from './modules';
import api from '../../redux/middlewares/api';
import apiGql from '../../redux/middlewares/apiGql';

let testStore;

if (
    process.env.NODE_ENV !== 'production' &&
    window.__REDUX_DEVTOOLS_EXTENSION__
) {
    const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__;
    testStore = createStore(
        rootReducer,
        composeEnhancers(applyMiddleware(thunk, apiGql, api))
    );
} else {
    testStore = createStore(rootReducer, applyMiddleware(thunk, apiGql, api));
}

export default testStore;
