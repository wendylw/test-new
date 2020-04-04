import Utils from '../../../utils/utils';

export const isSourceBeepitCom = () => Utils.getQueryString('source') === 'beepit.com';
