import { get } from './request';
import Url from './url';
import utils from './utils';

const FETCH_POLICY_ACTION = {
  UPLOAD_REPORT_DRIVER_PHOTO: 'upload-report-driver-photo',
};

export const fetchPolicyData = action => {
  const { url } = Url.API_URLS.GET_S3_POST_POLICY(action);
  return get(url);
};

export const postToS3 = (endPoint, formData) => {
  return fetch(endPoint, { method: 'post', body: formData }).then(response => {
    if (response.ok) {
      return {
        status: response.status,
        location: `${endPoint}/${formData.get('key')}`,
      };
    } else {
      return Promise.reject(response);
    }
  });
};

export const uploadReportDriverPhoto = async file => {
  const policyData = await fetchPolicyData(FETCH_POLICY_ACTION.UPLOAD_REPORT_DRIVER_PHOTO);
  const fileExtension = utils.getFileExtension(file);
  const key = `${policyData.prefixKey}.${fileExtension}`;

  const fd = new FormData();
  fd.append('key', key);
  fd.append('acl', policyData.acl);
  fd.append('Content-Type', file.type);
  fd.append('X-Amz-Credential', policyData.credential);
  fd.append('X-Amz-Algorithm', policyData.algorithm);
  fd.append('X-Amz-Date', policyData.date);
  fd.append('X-Amz-Meta-Tag', '');
  fd.append('Policy', policyData.policy);
  fd.append('X-Amz-Signature', policyData.signature);
  fd.append('file', file);

  return postToS3(policyData.endPoint, fd);
};
