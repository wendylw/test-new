import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Frame from '../../../common/components/Frame';
import MenuHeader from './components/MenuHeader';
import MenuStoreInfo from './components/MenuStoreInfo';
import PromotionBar from './components/PromotionBar';
import MenuProductList from './components/MenuProductList';
import ProductDetailDrawer from './components/ProductDetailDrawer';
import MenuFooter from './components/MenuFooter';
import MiniCart from './components/MiniCart';
import AlcoholModal from './components/AlcoholModal';
import MenuOfflineModal from './components/MenuOfflineModal';
import { mounted } from './redux/common/thunks';
import { getDeliveryInfo } from '../../redux/modules/app';

const Menu = () => {
  const dispatch = useDispatch();
  const { enableLiveOnline } = useSelector(getDeliveryInfo);
  console.log('enableLiveOnline', enableLiveOnline);

  useEffect(() => {
    dispatch(mounted());
  }, []);

  return (
    <Frame>
      <>
        {enableLiveOnline == null ? null : !enableLiveOnline ? (
          <>
            <MenuHeader />
            <MenuOfflineModal />
          </>
        ) : (
          <>
            <MenuHeader />
            <section className="tw-py-16 sm:tw-py-16px">
              <MenuStoreInfo />
              <PromotionBar />
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
