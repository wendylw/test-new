import { getAPIRequestRelativePath } from './utils';

describe('utils/monitoring/utils', () => {
  describe('test getAPIRequestRelativePath function', () => {
    // v2 API
    describe('test v2 APIs', () => {
      test("return '/api/ordering/stores/*' for getStoreIdHashCode url", () => {
        const getUrl = '/api/ordering/stores/62da7c6cc54471000742c9ab?a=redirectTo';
        expect(getAPIRequestRelativePath(getUrl)).toBe('/api/ordering/stores/*');
      });

      test("return '/api/ordering/stores/*' for createStoreIdTableIdHashCode url", () => {
        const postUrl = '/api/ordering/stores/62da7c6cc54471000742c9ab';
        expect(getAPIRequestRelativePath(postUrl)).toBe('/api/ordering/stores/*');
      });

      test("return '/api/ordering/stores/*' for postFoodCourtIdHashCode url", () => {
        const postUrl = '/api/ordering/stores/6260ddd8303ccb5ecd47e2d4';
        expect(getAPIRequestRelativePath(postUrl)).toBe('/api/ordering/stores/*');
      });

      test("return '/api/consumers/*/address' for site getAddressList url", () => {
        const getUrl = '/api/consumers/616652c5e9bba31aeaf74789/address';
        expect(getAPIRequestRelativePath(getUrl)).toBe('/api/consumers/*/address');
      });

      test("return '/api/consumers/*/address' for createAddress url", () => {
        const postUrl = '/api/consumers/616652c5e9bba31aeaf74789/address';
        expect(getAPIRequestRelativePath(postUrl)).toBe('/api/consumers/*/address');
      });

      test("return '/api/consumers/*/profile' for getProfileInfo url", () => {
        const getUrl = '/api/consumers/616652c5e9bba31aeaf74789/profile';
        expect(getAPIRequestRelativePath(getUrl)).toBe('/api/consumers/*/profile');
      });

      test("return '/api/consumers/*/customer' for getCustomProfileInfo url", () => {
        const getUrl = '/api/consumers/616652c5e9bba31aeaf74789/customer';
        expect(getAPIRequestRelativePath(getUrl)).toBe('/api/consumers/*/customer');
      });

      test("return '/api/consumers/*/vouchers' for getCustomVoucherList url", () => {
        const getUrl = '/api/consumers/616652c5e9bba31aeaf74789/vouchers?';
        expect(getAPIRequestRelativePath(getUrl)).toBe('/api/consumers/*/vouchers');
      });

      test("return '/api/consumers/*/vouchers' for getPromoInfo url", () => {
        const getUrl = '/api/consumers/616652c5e9bba31aeaf74789/vouchers?search=FREE&business=mickeymouseclubhouse';
        expect(getAPIRequestRelativePath(getUrl)).toBe('/api/consumers/*/vouchers');
      });

      test("return '/api/transactions/*/status' for getV2TransactionStatus url", () => {
        const getUrl = '/api/transactions/544516540905750/status';
        expect(getAPIRequestRelativePath(getUrl)).toBe('/api/transactions/*/status');
      });

      test("return '/api/consumers/*/address/*' for getUpdateDeliveryDetails url", () => {
        const putUrl = '/api/consumers/616652c5e9bba31aeaf74789/address/630dcd34d5a95bfbc12ba6b2';
        expect(getAPIRequestRelativePath(putUrl)).toBe('/api/consumers/*/address/*');
      });

      test("return '/api/consumers/*/address/*' for getUpdateAddressDetails url", () => {
        const putUrl = '/api/consumers/616652c5e9bba31aeaf74789/address/630dcd34d5a95bfbc12ba6b2';
        expect(getAPIRequestRelativePath(putUrl)).toBe('/api/consumers/*/address/*');
      });

      test("return '/api/cashback/hash/*/decode' for getDecodedHashData url", () => {
        const getUrl = '/api/cashback/hash/%2FNgSNqSiqLKugrwIw%2BrsvcGLo9AFP1KILG6SGoqi5xQ%3D%0A/decode';
        expect(getAPIRequestRelativePath(getUrl)).toBe('/api/cashback/hash/*/decode');
      });

      test("return '/api/consumers/*/transactions' for getOrderHistory url", () => {
        const getUrl = '/api/consumers/616652c5e9bba31aeaf74789/transactions?page=1&pageSize=15';
        expect(getAPIRequestRelativePath(getUrl)).toBe('/api/consumers/*/transactions');
      });

      test("return '/api/consumers/*/paymentMethods' for getOrderHistory url", () => {
        const getUrl = '/api/consumers/616652c5e9bba31aeaf74789/paymentMethods?provider=Stripe';
        expect(getAPIRequestRelativePath(getUrl)).toBe('/api/consumers/*/paymentMethods');
      });

      test("return '/api/consumers/*/store/*/address' for ordering getAddressList url", () => {
        const getUrl = '/api/consumers/616652c5e9bba31aeaf74789/store/620a319b5926990007a9724c/address';
        expect(getAPIRequestRelativePath(getUrl)).toBe('/api/consumers/*/store/*/address');
      });

      test("return '/api/consumers/*/store/*/address/*' for getDeliveryDetails url", () => {
        const getUrl =
          '/api/consumers/616652c5e9bba31aeaf74789/store/62dd8184c544710007431211/address/630dcd34d5a95bfbc12ba6b2';
        expect(getAPIRequestRelativePath(getUrl)).toBe('/api/consumers/*/store/*/address/*');
      });

      test("return '/api/consumers/*/favorites/stores/*/status' for getStoreFavStatus url", () => {
        const getUrl = '/api/consumers/616652c5e9bba31aeaf74789/favorites/stores/5df314fce192cc5fa77c114c/status';
        expect(getAPIRequestRelativePath(getUrl)).toBe('/api/consumers/*/favorites/stores/*/status');
      });

      test("return '/api/consumers/*/favorites/stores/*/status' for saveStoreFavStatus url", () => {
        const postUrl = '/api/consumers/616652c5e9bba31aeaf74789/favorites/stores/5df314fce192cc5fa77c114c/status';
        expect(getAPIRequestRelativePath(postUrl)).toBe('/api/consumers/*/favorites/stores/*/status');
      });
    });

    // v3 API
    describe('test v3 APIs', () => {
      test("return '/api/v3/cart/items/*' for deleteCartItemsById url", () => {
        const deleteUrl = '/api/v3/cart/items/41bf7fdcd081bf025746b80854ba19cf?shippingType=dineIn';
        expect(getAPIRequestRelativePath(deleteUrl)).toBe('/api/v3/cart/items/*');
      });

      test("return '/api/v3/food-courts/*/stores' for getFoodCourtStoreList url", () => {
        const getUrl = '/api/v3/food-courts/6260ddd8303ccb5ecd47e2d4/stores';
        expect(getAPIRequestRelativePath(getUrl)).toBe('/api/v3/food-courts/*/stores');
      });

      test("return '/api/v3/transactions/*/status' for getOrderSubmissionStatus url", () => {
        const getUrl = '/api/v3/transactions/544995588045974/status';
        expect(getAPIRequestRelativePath(getUrl)).toBe('/api/v3/transactions/*/status');
      });

      test("return '/api/v3/cart/submission/*/status' for getCartSubmissionStatus url", () => {
        const getUrl = '/api/v3/cart/submission/6b90fa58-c088-4ef2-8389-1e31bed0fb3d/status';
        expect(getAPIRequestRelativePath(getUrl)).toBe('/api/v3/cart/submission/*/status');
      });

      test("return '/api/v3/transactions/*/submission' for submitOrder url", () => {
        const postUrl = '/api/v3/transactions/544516157049082/submission';
        expect(getAPIRequestRelativePath(postUrl)).toBe('/api/v3/transactions/*/submission');
      });

      test("return '/api/v3/transactions/*/calculation' for getOrderWithCashback url", () => {
        const getUrl = '/api/v3/transactions/544516540905750/calculation';
        expect(getAPIRequestRelativePath(getUrl)).toBe('/api/v3/transactions/*/calculation');
      });

      test("return '/api/v3/transactions/*/status/cancel' for cancelOrder url", () => {
        const putUrl = '/api/v3/transactions/800861546562026/status/cancel';
        expect(getAPIRequestRelativePath(putUrl)).toBe('/api/v3/transactions/*/status/cancel');
      });

      test("return '/api/v3/transactions/*/apply-voucher' for applyVoucher url", () => {
        const postUrl = '/api/v3/transactions/544516540905750/apply-voucher';
        expect(getAPIRequestRelativePath(postUrl)).toBe('/api/v3/transactions/*/apply-voucher');
      });

      test("return '/api/v3/transactions/*/remove-voucher' for applyVoucher url", () => {
        const postUrl = '/api/v3/transactions/544516540905750/remove-voucher';
        expect(getAPIRequestRelativePath(postUrl)).toBe('/api/v3/transactions/*/remove-voucher');
      });

      test("return '/api/v3/transactions/*/apply-promotions' for applyPromotion url", () => {
        const postUrl = '/api/v3/transactions/544516540905750/apply-promotions';
        expect(getAPIRequestRelativePath(postUrl)).toBe('/api/v3/transactions/*/apply-promotions');
      });

      test("return '/api/v3/transactions/*/remove-promotions' for removePromotion url", () => {
        const postUrl = '/api/v3/transactions/544516540905750/remove-promotions';
        expect(getAPIRequestRelativePath(postUrl)).toBe('/api/v3/transactions/*/remove-promotions');
      });

      test("return '/api/v3/transactions/*/change-shipping-type' for updateOrderShippingType url", () => {
        const postUrl = '/api/v3/transactions/800488337730069/change-shipping-type';
        expect(getAPIRequestRelativePath(postUrl)).toBe('/api/v3/transactions/*/change-shipping-type');
      });
    });

    // API path with hostname
    describe('test APIs that paths contain hostnames', () => {
      describe('test non-wildcard API requests', () => {
        test("return '/api/gql/productdetail' if the original path contains HTTPS protocol, domain name, and port number", () => {
          expect(getAPIRequestRelativePath('https://mickeymouseclubhouse.beepit.com:443/api/gql/productdetail')).toBe(
            '/api/gql/productdetail'
          );
        });
        test("return '/api/gql/productdetail' if the original path contains HTTP protocol, domain name, and port number", () => {
          expect(getAPIRequestRelativePath('http://mickeymouseclubhouse.beepit.com:443/api/gql/productdetail')).toBe(
            '/api/gql/productdetail'
          );
        });
        test("return '/api/gql/productdetail' if the original path contains domain name and port number", () => {
          expect(getAPIRequestRelativePath('mickeymouseclubhouse.beepit.com:443/api/gql/productdetail')).toBe(
            '/api/gql/productdetail'
          );
        });
        test("return '/api/gql/productdetail' if the original path contains domain name", () => {
          expect(getAPIRequestRelativePath('mickeymouseclubhouse.beepit.com/api/gql/productdetail')).toBe(
            '/api/gql/productdetail'
          );
        });
      });

      describe('test wildcard API requests', () => {
        test("return '/api/consumers/*/address' if the original path contains HTTPS protocol, domain name, and port number", () => {
          expect(
            getAPIRequestRelativePath(
              'https://mickeymouseclubhouse.beepit.com:443/api/consumers/616652c5e9bba31aeaf74789/address'
            )
          ).toBe('/api/consumers/*/address');
        });
        test("return '/api/consumers/*/address' if the original path contains HTTP protocol, domain name, and port number", () => {
          expect(
            getAPIRequestRelativePath(
              'http://mickeymouseclubhouse.beepit.com:443/api/consumers/616652c5e9bba31aeaf74789/address'
            )
          ).toBe('/api/consumers/*/address');
        });
        test("return '/api/consumers/*/address' if the original path contains domain name and port number", () => {
          expect(
            getAPIRequestRelativePath(
              'mickeymouseclubhouse.beepit.com:443/api/consumers/616652c5e9bba31aeaf74789/address'
            )
          ).toBe('/api/consumers/*/address');
        });
        test("return '/api/consumers/*/address' if the original path contains domain name", () => {
          expect(
            getAPIRequestRelativePath('mickeymouseclubhouse.beepit.com/api/consumers/616652c5e9bba31aeaf74789/address')
          ).toBe('/api/consumers/*/address');
        });
      });
    });

    // Non-wildcard API request case
    describe('test non-wildcard API request cases', () => {
      test("return '/api/gql/ProductDetail' for fetchProductDetail url", () => {
        const postUrl = '/api/gql/ProductDetail';
        expect(getAPIRequestRelativePath(postUrl)).toBe('/api/gql/ProductDetail');
      });

      test("return '/api/v3/cart' for fetchShoppingCartInfo url", () => {
        const postUrl = '/api/v3/cart';
        expect(getAPIRequestRelativePath(postUrl)).toBe('/api/v3/cart');
      });
    });

    describe('test missing wildcard pattern API request cases in different modes', () => {
      const originalNodeEnv = process.env.NODE_ENV;

      afterAll(() => {
        // Reset
        process.env.NODE_ENV = originalNodeEnv;
      });

      // Show warning if the path matches the wildcard patterns but is not in the pattern list
      describe('show warning in debug mode', () => {
        beforeEach(() => {
          process.env.NODE_ENV = 'development';
          console.warn = jest.fn();
        });

        test('return original path even it contains mongo object id', () => {
          expect(getAPIRequestRelativePath('/api/mongodb/id/62da7c6cc54471000742c9ab')).toBe(
            '/api/mongodb/id/62da7c6cc54471000742c9ab'
          );
          expect(console.warn).toHaveBeenCalledTimes(1);
          expect(getAPIRequestRelativePath('/api/mongodb/id/fcda7c6cc54471000742c9ab')).toBe(
            '/api/mongodb/id/fcda7c6cc54471000742c9ab'
          );
          expect(console.warn).toHaveBeenCalledTimes(2);
        });

        test('return original path even it contains UUID', () => {
          expect(getAPIRequestRelativePath('/api/submission/id/6b90fa58-c088-4ef2-8389-1e31bed0fb3d')).toBe(
            '/api/submission/id/6b90fa58-c088-4ef2-8389-1e31bed0fb3d'
          );
          expect(console.warn).toHaveBeenCalledTimes(1);
          expect(getAPIRequestRelativePath('/api/submission/id/fc90fa58-c088-4ef2-8389-1e31bed0fb3d')).toBe(
            '/api/submission/id/fc90fa58-c088-4ef2-8389-1e31bed0fb3d'
          );
          expect(console.warn).toHaveBeenCalledTimes(2);
        });

        test('return original path even it contains transaction id', () => {
          expect(getAPIRequestRelativePath('/api/transaction/id/544516540905750')).toBe(
            '/api/transaction/id/544516540905750'
          );
          expect(console.warn).toHaveBeenCalledTimes(1);
        });

        test('return original path even it contains encoded hash', () => {
          expect(getAPIRequestRelativePath('/api/hash/%2FNgSNqSiqLKugrwIw%2BrsvcGLo9AFP1KILG6SGoqi5xQ%3D%0A')).toBe(
            '/api/hash/%2FNgSNqSiqLKugrwIw%2BrsvcGLo9AFP1KILG6SGoqi5xQ%3D%0A'
          );
          expect(console.warn).toHaveBeenCalledTimes(1);
          expect(
            getAPIRequestRelativePath(
              '/api/hash/U2FsdGVkX1%2B7ywLBxi%2BBtpM7%2BMeJl1mP2Hg7K5SDxqMtGw283ljcTRjEiGB%2BkdOd'
            )
          ).toBe('/api/hash/U2FsdGVkX1%2B7ywLBxi%2BBtpM7%2BMeJl1mP2Hg7K5SDxqMtGw283ljcTRjEiGB%2BkdOd');
          expect(console.warn).toHaveBeenCalledTimes(2);
          expect(
            getAPIRequestRelativePath('/api/hash/U2FsdGVkX19RCOHkkg8vcshVnAkBsevxWSV0uAS0T4EHBgrg0PIwouYgUutMGpsN')
          ).toBe('/api/hash/U2FsdGVkX19RCOHkkg8vcshVnAkBsevxWSV0uAS0T4EHBgrg0PIwouYgUutMGpsN');
          expect(console.warn).toHaveBeenCalledTimes(3);
        });

        test('return original path even it contains null value', () => {
          const getUrl = '/api/v3/submission/null/status';
          expect(getAPIRequestRelativePath(getUrl)).toBe('/api/v3/submission/null/status');
          expect(console.warn).toHaveBeenCalledTimes(1);
        });
      });

      // Hide warning even if the path matches the wildcard patterns but is not in the pattern list
      describe('hide warning in production mode', () => {
        beforeEach(() => {
          process.env.NODE_ENV = 'production';
          console.warn = jest.fn();
        });

        test('return original path even it contains mongo object id', () => {
          const getUrl = '/api/mongodb/id/62da7c6cc54471000742c9ab';
          expect(getAPIRequestRelativePath(getUrl)).toBe('/api/mongodb/id/62da7c6cc54471000742c9ab');
          expect(console.warn).toHaveBeenCalledTimes(0);
        });

        test('return original path even it contains UUID', () => {
          const getUrl = '/api/submission/id/6b90fa58-c088-4ef2-8389-1e31bed0fb3d';
          expect(getAPIRequestRelativePath(getUrl)).toBe('/api/submission/id/6b90fa58-c088-4ef2-8389-1e31bed0fb3d');
          expect(console.warn).toHaveBeenCalledTimes(0);
        });

        test('return original path even it contains encoded hash', () => {
          const getUrl = '/api/hash/34%2FNgSNqSiqLKugrwIw%2BrsvcGLo9P1KILG6SGoqi5xQ%3D%0A';
          expect(getAPIRequestRelativePath(getUrl)).toBe(
            '/api/hash/34%2FNgSNqSiqLKugrwIw%2BrsvcGLo9P1KILG6SGoqi5xQ%3D%0A'
          );
          expect(console.warn).toHaveBeenCalledTimes(0);
        });

        test('return original path even it contains null value', () => {
          const getUrl = '/api/v3/submission/null/status';
          expect(getAPIRequestRelativePath(getUrl)).toBe('/api/v3/submission/null/status');
          expect(console.warn).toHaveBeenCalledTimes(0);
        });
      });
    });
  });
});
