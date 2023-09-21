import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { X, Trash } from 'phosphor-react';
import { useUnmount } from 'react-use';
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
import { getCartItems, getCartQuantity, getIsMiniCartDrawerVisible } from '../../redux/cart/selectors';
import { getIsDineType } from '../../../../redux/modules/app';
import styles from './MiniCart.module.scss';

const MiniCart = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const cartItems = useSelector(getCartItems);
  const cartQuantity = useSelector(getCartQuantity);
  const isMiniCartDrawerVisible = useSelector(getIsMiniCartDrawerVisible);
  const isDineType = useSelector(getIsDineType);

  useEffect(() => {
    // if there is no cart item, then hide mini cart drawer
    if (isMiniCartDrawerVisible && cartQuantity === 0) {
      dispatch(hideMiniCartDrawer());
    }
  }, [cartQuantity, dispatch, isMiniCartDrawerVisible]);

  useUnmount(() => {
    if (isMiniCartDrawerVisible) {
      dispatch(hideMiniCartDrawer());
    }
  });

  return (
    <Drawer
      className={styles.miniCartDrawer}
      show={isMiniCartDrawerVisible}
      onClose={() => dispatch(hideMiniCartDrawer())}
      zIndex={40}
      respectSpaceOccupation
      header={
        <DrawerHeader
          left={
            <X
              weight="light"
              className="tw-flex-shrink-0 tw-text-2xl tw-text-gray"
              data-test-id="ordering.menu.mini-cart.close-btn"
              onClick={() => dispatch(hideMiniCartDrawer())}
            />
          }
          right={
            <Button
              type="text"
              theme="danger"
              className={styles.removeAllButton}
              data-test-id="ordering.menu.mini-cart.remove-btn"
              icon={<Trash size={18} />}
              onClick={() => {
                dispatch(removeAllCartItems());
              }}
            >
              {t('RemoveAll')}
            </Button>
          }
        >
          <div className="tw-flex tw-flex-col tw-items-center">
            <span className="tw-font-bold tw-text-lg">{t('Cart')}</span>
          </div>
        </DrawerHeader>
      }
    >
      <ul className="tw-px-16 sm:tw-px-16px">
        {cartItems.map(item => (
          <CartItem
            item={item}
            key={item.id}
            isDineType={isDineType}
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
