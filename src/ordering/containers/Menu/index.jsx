import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useMount, useUnmount } from 'react-use';
import usePrefetch from '../../../common/utils/hooks/usePrefetch';
import Frame from '../../../common/components/Frame';
import MenuShippingInfoBar from './components/MenuShippingInfoBar';
import MenuHeader from './components/MenuHeader';
import MenuStoreInfo from './components/MenuStoreInfo';
import PromotionBar from './components/PromotionBar';
import MenuProductList from './components/MenuProductList';
import ProductDetailDrawer from './components/ProductDetailDrawer';
import MenuFooter from './components/MenuFooter';
import MiniCart from './components/MiniCart';
import AlcoholModal from './components/AlcoholModal';
import MenuOfflineModal from './components/MenuOfflineModal';
import MenuSkeleton from './components/MenuSkeleton';
import {
  getIsCoreBusinessAPIPending,
  getIsSearchingBannerVisible,
  getShouldShowOfflineMenu,
} from './redux/common/selectors';
import { mounted, willUnmount } from './redux/common/thunks';

const Menu = () => {
  const dispatch = useDispatch();
  // for whether display searching banner, if not header, store info and promo banner display
  const isSearchingBannerVisible = useSelector(getIsSearchingBannerVisible);
  const shouldShowOfflineMenu = useSelector(getShouldShowOfflineMenu);
  const shouldShowMenuSkeleton = useSelector(getIsCoreBusinessAPIPending);

  useMount(() => {
    dispatch(mounted());
  });

  useUnmount(async () => {
    await dispatch(willUnmount());
  });

  usePrefetch(['ORD_SC', 'ORD_TS'], ['OrderingCart', 'OrderingPromotion', 'OrderingTableSummary']);

  return (
    <Frame>
      <>
        {shouldShowOfflineMenu ? (
          <>
            <MenuHeader />
            <MenuOfflineModal />
          </>
        ) : shouldShowMenuSkeleton ? (
          <MenuSkeleton />
        ) : (
          <>
            <MenuHeader webHeaderVisibility={!isSearchingBannerVisible} />
            <MenuShippingInfoBar />
            <section className="tw-py-16 sm:tw-py-16px">
              {isSearchingBannerVisible ? null : (
                <>
                  <MenuStoreInfo />
                  <PromotionBar />
                </>
              )}
              <MenuProductList />
            </section>
            <MenuFooter />
            <ProductDetailDrawer />
            <MiniCart />
            <AlcoholModal />
          </>
        )}
      </>
    </Frame>
  );
};

Menu.displayName = 'Menu';

export default Menu;
