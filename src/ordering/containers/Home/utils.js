import Utils from '../../../utils/utils';
import config from '../../../config';

export const isSourceBeepitCom = () => Utils.getQueryString('source') === 'beepit.com';

export const getMerchantStoreUrl = (business, hash, source, deliveryType) =>
  `${config.beepOnlineStoreUrl(business)}/ordering/?h=${hash}&type=${deliveryType}&source=${source}`;
