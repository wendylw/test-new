import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useMount } from 'react-use';
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
import { getIsSearchingBannerVisible } from './redux/common/selectors';
import { mounted } from './redux/common/thunks';
import { getDeliveryInfo } from '../../redux/modules/app';
import { confirm } from '../../../common/utils/feedback';

const Menu = () => {
  const dispatch = useDispatch();
  // for whether display searching banner, if not header, store info and promo banner display
  const isSearchingBannerVisible = useSelector(getIsSearchingBannerVisible);
  const { enableLiveOnline } = useSelector(getDeliveryInfo);

  useMount(() => {
    dispatch(mounted());
  });

  return (
    <Frame>
      <>
        {/*
         * Checking [enableLiveOnline] whether equal null is ensuring the "CoreBusiness" API Request has completed
         * if we don't add this checking, The page will display store closed view a few seconds.
         * TODO: This isn't a better way, it will cause issue FB-4265, should check the API request status instead of it.
         */}
        {enableLiveOnline == null ? null : !enableLiveOnline ? (
          <>
            <MenuHeader />
            <MenuOfflineModal />
          </>
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
