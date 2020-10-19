import businessesReducers, { getAllBusinesses, getBusinessByName } from './businesses';
import mockState from '../../__fixtures__/state.fixture';
import { APP_TYPES } from '../../../cashback/redux/types';

const initialState = {
  businesses: {},
};

describe('src/redux/modules/entities/businesses.js:reducers', () => {
  it('should return the initial state', () => {
    expect(businessesReducers(initialState, {})).toEqual({ ...initialState, loaded: false });
  });
  describe('action with responseGql', () => {
    it('valid business', () => {
      const businessInfo = {
        country: 'my',
        name: 'mockName',
        stores: [
          {
            id: '5de71ef1e872af6ab28a6c74',
            name: 'coffee',
            isOnline: true,
            isDeleted: null,
            street1: '10 Boulevard, 47400 Jalan Kenanga, Damansara, Selangor, Malaysia.',
            street2: '',
            city: 'universe',
            state: 'normal',
          },
          {
            id: '5de72d57e872af6ab28a7809',
            name: 'Mercy',
            isOnline: true,
            isDeleted: null,
            street1: '10 Boulevard, 47400 Jalan Kenanga, Damansara, Selangor, Malaysia.',
            street2: '',
            city: 'my',
            state: 'normal',
          },
        ],
      };
      const action = {
        type: 'STORES/HOME/FETCH_CORESTORES_SUCCESS',
        responseGql: {
          data: {
            business: businessInfo,
          },
        },
      };
      const expectedState = {
        businesses: {},
        loaded: true,
        mockName: businessInfo,
      };
      expect(businessesReducers(initialState, action)).toEqual(expectedState);
    });
    it('no valid business', () => {
      const action = {
        type: 'STORES/HOME/FETCH_CORESTORES_SUCCESS',
        responseGql: {
          data: {},
        },
      };
      expect(businessesReducers(initialState, action)).toEqual(initialState);
    });
  });
  it('actionType:APP_TYPES.FETCH_BUSINESS_SUCCESS', () => {
    const action = {
      type: APP_TYPES.FETCH_BUSINESS_SUCCESS,
      response: {
        name: 'mockName',
        test: 'hello',
      },
    };
    expect(businessesReducers(initialState, action)).toEqual({
      businesses: {},
      mockName: {
        name: 'mockName',
        test: 'hello',
      },
    });
  });
});
describe('src/redux/modules/entities/businesses.js:selectors', () => {
  it('getAllBusinesses', () => {
    expect(getAllBusinesses(mockState)).toEqual(mockState.entities.businesses);
  });
  it('getLoyaltyHistoriesByCustomerId', () => {
    expect(getBusinessByName(mockState, 'mockName')).toEqual({
      name: 'mockName',
      enablePax: false,
      enableServiceCharge: false,
      enableCashback: true,
      serviceChargeRate: null,
      serviceChargeTax: null,
      subscriptionStatus: 'Active',
      qrOrderingSettings: null,
      stores: [],
    });
  });
});
