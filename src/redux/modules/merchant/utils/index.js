import { getQueryString } from '../../../../common/utils';
import config from '../../../../config';

export const getBusinessDefaultValue = () => getQueryString('business') || config.business || null;
