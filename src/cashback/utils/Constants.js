const api = {};

api.PREFIX = '/cash-back';

api.HOME = `${api.PREFIX}/home`;
api.USERS = `${api.PREFIX}/users`;
api.RESULT = `${api.PREFIX}/result`;
api.CODE = `${api.PREFIX}/codes`;
api.CODE_VERIFY = otp => `${api.PREFIX}/codes/${otp}/verify`;
api.LOYALTY = customId => `${api.PREFIX}/users/${customId}/loyalty`;

export default {
  api,
};
