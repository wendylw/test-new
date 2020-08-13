import appReducers, {
  initialState,
  getBusiness,
  getError,
  getOnlineStoreInfo,
  getRequestInfo,
  getMessageModal,
  types,
} from './app';
import rootReducer from './index';
import { getReducerNewState } from '../../../utils/testHelper';

describe('src/stores/redux/modules/app.js:reducers', () => {
  it('should return the initial state', () => {
    expect(appReducers(undefined, {})).toEqual(initialState);
  });
  describe('error', () => {
    const nameField = 'error';
    const errorActionInfo = {
      error: {
        info: 'mockError',
      },
    };
    it('CLEAR_ERROR with code equal 200', () => {
      const action = {
        type: types.CLEAR_ERROR,
        ...errorActionInfo,
      };
      expect(getReducerNewState(appReducers, action, nameField)).toEqual(null);
    });
    it('not clear_error', () => {
      const action = {
        type: 'whatever',
        ...errorActionInfo,
      };
      expect(getReducerNewState(appReducers, action, nameField)).toEqual(null);
    });
  });
  describe('business', () => {
    const nameField = 'business';
    it('should return initial business state', () => {
      expect(getReducerNewState(appReducers, { type: 'none' }, nameField)).toEqual(initialState.business);
    });
  });
  describe('onlineStoreInfo', () => {
    const nameField = 'onlineStoreInfo';
    const onlineStoreInfoActionInfo = {
      responseGql: {
        data: {
          onlineStoreInfo: {
            id: '123456',
          },
        },
      },
    };
    it('no responseGql in action,should return initial onlineStoreInfo state', () => {
      const action = {
        type: types.FETCH_ONLINESTOREINFO_SUCCESS,
      };
      expect(getReducerNewState(appReducers, action, nameField)).toEqual({
        ...initialState.onlineStoreInfo,
      });
    });
    it('FETCH_ONLINESTOREINFO_REQUEST', () => {
      const action = {
        type: types.FETCH_ONLINESTOREINFO_REQUEST,
        ...onlineStoreInfoActionInfo,
      };
      expect(getReducerNewState(appReducers, action, nameField)).toEqual({
        ...initialState.onlineStoreInfo,
        isFetching: true,
      });
    });
    it('FETCH_ONLINESTOREINFO_SUCCESS', () => {
      const action = {
        type: types.FETCH_ONLINESTOREINFO_SUCCESS,
        ...onlineStoreInfoActionInfo,
      };
      expect(getReducerNewState(appReducers, action, nameField)).toEqual({
        ...initialState.onlineStoreInfo,
        isFetching: false,
        id: '123456',
      });
    });
    it('FETCH_ONLINESTOREINFO_FAILURE', () => {
      const action = {
        type: types.FETCH_ONLINESTOREINFO_FAILURE,
        ...onlineStoreInfoActionInfo,
      };
      expect(getReducerNewState(appReducers, action, nameField)).toEqual({
        ...initialState.onlineStoreInfo,
        isFetching: false,
      });
    });
    it('default', () => {
      expect(getReducerNewState(appReducers, { type: 'default' }, nameField)).toEqual({
        ...initialState.onlineStoreInfo,
      });
    });
  });
  describe('messageModal', () => {
    const nameField = 'messageModal';
    const messageModalActionInfo = {
      message: 'mockMessage',
      description: 'mockDescription',
    };
    it('SET_MESSAGE_INFO', () => {
      const action = {
        type: types.SET_MESSAGE_INFO,
        ...messageModalActionInfo,
      };
      const expectedState = {
        ...initialState.messageModal,
        show: true,
        message: 'mockMessage',
        description: 'mockDescription',
      };
      expect(getReducerNewState(appReducers, action, nameField)).toEqual(expectedState);
    });
    it('HIDE_MESSAGE_MODAL', () => {
      const action = {
        type: types.HIDE_MESSAGE_MODAL,
        ...messageModalActionInfo,
      };
      const expectedState = {
        ...initialState.messageModal,
        show: false,
        message: '',
        description: '',
      };
      expect(getReducerNewState(appReducers, action, nameField)).toEqual(expectedState);
    });
    it('default', () => {
      expect(getReducerNewState(appReducers, { type: 'default' }, nameField)).toEqual({
        ...initialState.messageModal,
      });
    });
  });
  describe('requestInfo', () => {
    const nameField = 'requestInfo';
    it('should return initial requestInfo state', () => {
      expect(getReducerNewState(appReducers, { type: 'none' }, nameField)).toEqual(initialState.requestInfo);
    });
  });
});

describe('src/stores/redux/modules/appReducers.js:selectors', () => {
  const state = rootReducer(undefined, { type: null });

  it('getBusiness', () => {
    const expectedState = initialState.business;
    expect(getBusiness(state)).toEqual(expectedState);
  });
  it('getError', () => {
    const expectedState = initialState.error;
    expect(getError(state)).toEqual(expectedState);
  });
  it('getOnlineStoreInfo', () => {
    expect(getOnlineStoreInfo(state)).toEqual(undefined);
  });
  it('getRequestInfo', () => {
    const expectedState = initialState.requestInfo;
    expect(getRequestInfo(state)).toEqual(expectedState);
  });

  it('getMessageModal', () => {
    const expectedState = initialState.messageModal;
    expect(getMessageModal(state)).toEqual(expectedState);
  });
});
