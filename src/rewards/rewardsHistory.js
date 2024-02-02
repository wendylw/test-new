import { createBrowserHistory } from 'history';
import { PATH_NAME_MAPPING } from '../common/utils/constants';

export default createBrowserHistory({
  basename: PATH_NAME_MAPPING.REWARDS_BASE,
});
