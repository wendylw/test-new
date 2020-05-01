import Utils from '../../../utils/utils';
import { get } from '../../../utils/request';

export const isSourceBeepitCom = () => {
  const source = Utils.getQueryString('source');
  if (source) {
    const match = source.match(/^(?:https?:\/\/)?([^:/?#]+)/im);
    if (match) {
      const domain = match[1];
      return Utils.isSiteApp(domain);
    }
  }
  return false;
};

// todo: this should be global use
export const fetchRedirectPageState = async () => {
  try {
    return await get('/go2page/state');
  } catch (e) {
    console.error(e);
    return {};
  }
};
