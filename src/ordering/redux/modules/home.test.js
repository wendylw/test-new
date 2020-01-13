import {
    fetchShoppingCart,
    fetchOnlineCategory,
    removeShoppingCartItem,
    addOrUpdateShoppingCartItem,
    fetchProductDetail,
    getShoppingCart as getShoppingCartSelector,
    getCategoryProductList as getCategoryProductListSelector,

} from './home';
import {
    fetchShoppingCartData,
    fetchOnlineCategoryData,
    RemoveShoppingCartItemData,
    AddOrUpdateShoppingCartItemData,
    fetchProductDetailData,
    productParams,
    getShoppingCartSelectorResult,
    getCategoryProductListSelectorResult

} from '../__fixtures__/home.fixture';
import testStore from '../testStore';


const getHomeState = (state) => {
    return state.getState().home;
}

describe('src/ordering/redux/modules/home: actions and reducers', () => {
    beforeEach(() => {
        fetch.resetMocks();
    });
    describe('loadProductList', () => {
        it("fetchingOnlineCategory", async () => {
            // mock expected state
            const expectedState = {
                ...testStore.onlineCategory,
                isFetching: false,
                categoryIds: [
                    '5da845cf2d7b4244276bddb2',
                    '5cdce13be5fea1125c716dd5',
                    '5cd159c1fb012d7c4b1c9f9d',
                ]
            }
            // mock fetch response
            fetch.mockResponseOnce(
                JSON.stringify(fetchOnlineCategoryData)
            );
            // dispatch action
            await testStore.dispatch(fetchOnlineCategory());

            // get state value
            const homeState = getHomeState(testStore);
            expect(homeState.onlineCategory).toEqual(expectedState);
        });
    });
    describe('loadShoppingCart', () => {
        it('fetchShoppingCart', async () => {
            const expectedState = {
                ...testStore.shoppingCart,
                isFetching: false,
                itemIds: [
                    'd79db2cd92d785e5d4c07e046052bb34',
                    '41f0bafe441a059d8f76f2c966732b85',
                    '3c81558b01e1c770b6442b9fd0f6d763',
                ],
                unavailableItemIds: [],
            };
            fetch.mockResponseOnce(
                JSON.stringify(fetchShoppingCartData)
            );
            await testStore.dispatch(fetchShoppingCart());
            const homeState = getHomeState(testStore);
            expect(homeState.shoppingCart).toEqual(expectedState);
        });
    })
    it('removeShoppingCartItem', async () => {
        const expectedState = { ...testStore.getState().home };
        fetch.mockResponseOnce(
            JSON.stringify(RemoveShoppingCartItemData)
        );
        await testStore.dispatch(removeShoppingCartItem({}));
        const homeState = getHomeState(testStore);
        expect(homeState).toEqual(expectedState);
    });
    it('addOrUpdateShoppingCartItem', async () => {
        const expectedState = { ...testStore.getState().home };
        fetch.mockResponseOnce(
            JSON.stringify(AddOrUpdateShoppingCartItemData)
        );
        await testStore.dispatch(addOrUpdateShoppingCartItem({}));
        const homeState = getHomeState(testStore);
        expect(homeState).toEqual(expectedState);
    });
    describe("increaseProductInCart", () => {
        const { dispatch } = testStore;
        it('currentProduct not equal productParams', async () => {
            const homeState = getHomeState(testStore);
            const { currentProduct } = homeState;

            if (currentProduct.id !== productParams.id) {
                const expectedState = {
                    ...homeState.currentProduct,
                    isFetching: false,
                    id: '5dbfcc7f637055227dd94e58',
                };
                fetch.mockResponseOnce(
                    JSON.stringify(fetchProductDetailData)
                );
                await dispatch(fetchProductDetail({}));
                expect(getHomeState(testStore).currentProduct).toEqual(expectedState);

            }
        });
    })

});

describe("src/ordering/redux/modules/home: selectors", () => {
    it("getShoppingCart", () => {
        const getShoppingCartRes = getShoppingCartSelector(testStore.getState());
        expect(getShoppingCartRes).toEqual(getShoppingCartSelectorResult);
    });
    it("getCategoryProductList", () => {
        const getCategoryProductListRes = getCategoryProductListSelector(testStore.getState());
        expect(getCategoryProductListRes).toEqual(getCategoryProductListSelectorResult);
    });
});
