import RequestError from '../../../utils/api/request-error';

const commonSuccessData = {
  status: 'ok',
};
const commonFailResponse = new RequestError('fake error message', { code: 401 });
export { commonSuccessData, commonFailResponse };
