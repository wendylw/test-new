import { getQueryString } from '../../../../common/utils';

export const getBusinessDefaultValue = () => getQueryString('business') || '';
