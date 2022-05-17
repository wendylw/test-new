import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { X, Trash } from 'phosphor-react';
import Drawer from '../../../../../common/components/Drawer';
import DrawerHeader from '../../../../../common/components/Drawer/DrawerHeader';
import Button from '../../../../../common/components/Button';
import CartItem from './CartItem';
import {
  hideMiniCartDrawer,
  removeAllCartItems,
  increaseCartItemQuantity,
  decreaseCartItemQuantity,
} from '../../redux/cart/thunks';
import { getCartItems, getIsCartFooterVisible, getIsMiniCartDrawerVisible } from '../../redux/cart/selectors';
import styles from './MiniCart.module.scss';

const MiniCart = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const cartItems = useSelector(getCartItems);
  const isMiniCartDrawerVisible = useSelector(getIsMiniCartDrawerVisible);
  const isCartFooterVisible = useSelector(getIsCartFooterVisible);
  console.log('isMiniCartDrawerVisible', isMiniCartDrawerVisible);
  console.log('isCartFooterVisible', isCartFooterVisible);

  return (
    <Drawer
      className={styles.miniCartDrawer}
      show={isMiniCartDrawerVisible || isCartFooterVisible}
      onClose={() => dispatch(hideMiniCartDrawer())}
      zIndex={40}
      respectSpaceOccupation
      header={
        <DrawerHeader
          left={<X size={24} onClick={() => dispatch(hideMiniCartDrawer())} />}
          right={
            <Button
              onClick={() => {
                dispatch(removeAllCartItems());
              }}
              className={styles.removeAllButton}
              type="text"
              danger
              icon={<Trash size={18} />}
            >
              {t('RemoveAll')}
            </Button>
          }
        >
          <span className="tw-font-bold tw-text-lg">{t('Cart')}</span>
        </DrawerHeader>
      }
    >
      <ul className="tw-px-16 sm:tw-px-16px">
        {cartItems.map(item => (
          <CartItem
            item={item}
            key={item.id}
            onIncreaseCartItemQuantity={() => {
              dispatch(increaseCartItemQuantity({ cartItemId: item.id }));
            }}
            onDecreaseCartItemQuantity={() => {
              dispatch(decreaseCartItemQuantity({ cartItemId: item.id }));
            }}
          />
        ))}
      </ul>
    </Drawer>
  );
};

MiniCart.displayName = 'MiniCart';

export default MiniCart;
