import Utils from '../../../utils/utils';
import { get } from '../../../utils/request';

export const isSourceBeepitCom = () => Utils.getQueryString('source') === 'beepit.com';

// todo: this should be global use
export const fetchRedirectPageState = async () => {
  try {
    return await get('/go2page/state');
  } catch (e) {
    console.error(e);
    return {};
  }
};
