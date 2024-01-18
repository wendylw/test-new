import { actions, types } from './app';
import { store } from '../../../utils/testHelper';

describe('src/stores/redux/modules/app.js:actions', () => {
  beforeEach(() => {
    fetch.resetMocks();
  });
  afterEach(() => {
    store.clearActions();
  });
  describe('action creators', () => {
    it('clearError', () => {
      const expectedAction = {
        type: types.CLEAR_ERROR,
      };
      return expect(actions.clearError()).toEqual(expectedAction);
    });
    it('showMessageModal', () => {
      const reqParams = { message: 'hello', description: 'hello' };
      const expectedAction = {
        type: types.SET_MESSAGE_INFO,
        message: reqParams.message,
        description: reqParams.description,
      };
      return expect(actions.showMessageModal(reqParams)).toEqual(expectedAction);
    });
    it('hideMessageModal', () => expect(actions.hideMessageModal()).toEqual({ type: types.HIDE_MESSAGE_MODAL }));
  });
});
