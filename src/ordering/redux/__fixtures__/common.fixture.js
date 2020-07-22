import { RequestError } from '../../../utils/request';

const commonSuccessData = {
  status: 'ok',
};
const commonFailResponse = new RequestError('fake error message', 401);
export { commonSuccessData, commonFailResponse };
