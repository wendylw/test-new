const api = {};

api.PREFIX = '/api/cashback';

// api.getCashbackHashData = hash => `${api.PREFIX}/hash/${hash}/decode`;
// api.CASHBACK = `${api.PREFIX}`;
api.CODE = `${api.PREFIX}/codes`;
api.HISTORY = `${api.PREFIX}/history`;
// api.BUSINESS = `${api.PREFIX}/business`;

api.HOME = `${api.PREFIX}/home`;
api.USERS = `${api.PREFIX}/users`;
api.RESULT = `${api.PREFIX}/result`;
api.CODE_VERIFY = otp => `${api.PREFIX}/codes/${otp}/verify`;
api.LOYALTY = customId => `${api.PREFIX}/users/${customId}/loyalty`;

export default {
  api,
};
