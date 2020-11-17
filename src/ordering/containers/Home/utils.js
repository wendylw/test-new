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

export const windowSize = () => ({
  width: document.body.clientWidth || window.innerWidth,
  height: document.body.clientHeight || window.innerHeight,
});

export const mainTop = ({ headerEls = [] }) => {
  let top = 0;

  if (headerEls.length) {
    headerEls.forEach(headerEl => {
      top += headerEl ? headerEl.clientHeight || headerEl.offsetHeight : 0;
    });
  }

  return top;
};

export const marginBottom = ({ footerEls = [] }) => {
  let bottom = 0;

  if (footerEls.length) {
    footerEls.forEach(footerEl => {
      bottom += footerEl ? footerEl.clientHeight || footerEl.offsetHeight : 0;
    });
  }

  return bottom;
};
