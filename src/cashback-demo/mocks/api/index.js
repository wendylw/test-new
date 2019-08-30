import Constants from '../../utils/Constants';
import fakeHome from './home';
import fakeCode from './code';
import fakeCodeVerify from './codeVerify';
import fakePostUser from './postUsers';

export default mock => {
  mock.onGet(Constants.api.HOME).reply(200, fakeHome);
  mock.onPost(Constants.api.CODE).reply(200, fakeCode);
  // mock.onGet(new RegExp(`${Constants.api.CODE_VERIFY('12345')}.*`)).reply(200, fakeCodeVerify);
  mock.onGet(Constants.api.CODE_VERIFY('12345'), {
    params: {
      phone: '+123',
    },
  }).reply(200, fakeCodeVerify);
  mock.onPost(Constants.api.USERS).reply(200, fakePostUser);
};
