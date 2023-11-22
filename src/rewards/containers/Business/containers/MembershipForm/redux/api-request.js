import { post } from '../../../../../../utils/api/api-fetch';

export const postUserMembership = () => post('/api/join/membership');
