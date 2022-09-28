import { get } from '../../../utils/api/api-fetch';

export const getFiles = fileType => get(`/api/files/${fileType}`);
