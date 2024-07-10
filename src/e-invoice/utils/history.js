import { createBrowserHistory } from 'history';
import { PATHS } from './constants';

export default createBrowserHistory({
  basename: PATHS.E_INVOICE,
});
