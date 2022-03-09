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
import { getIsMiniCartDrawerVisible, getIsCartFooterVisible } from './redux/cart/selectors';
import { mounted } from './redux/common/thunks';

const Menu = () => {
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(mounted());
  }, []);
  const isMiniCartDrawerVisible = useSelector(getIsMiniCartDrawerVisible);
  const isCartFooterVisible = useSelector(getIsCartFooterVisible);

  return (
    <Frame>
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
    </Frame>
  );
};

Menu.displayName = 'Menu';

export default Menu;
