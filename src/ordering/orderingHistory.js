import { createBrowserHistory } from 'history';
import constants from '../utils/constants';

export default createBrowserHistory({
  basename: constants.ROUTER_PATHS.ORDERING_BASE,
});
