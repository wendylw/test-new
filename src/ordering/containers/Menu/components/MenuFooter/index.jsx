import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { HandbagSimple } from 'phosphor-react';
import Button from '../../../../../common/components/Button';
import PageFooter from '../../../../../common/components/PageFooter';
import Badge from '../../../../../common/components/Badge';
import MenuViewOrderBar from './MenuViewOrderBar';
import { getIsVirtualKeyboardVisible, getIsAbleToReviewCart } from '../../redux/common/selectors';
import {
  getCartQuantity,
  getCartItemsFormattedSubtotal,
  getIsFulfillMinimumConsumption,
  getMinimumConsumptionFormattedPrice,
  getIsEnablePayLater,
  getIsCartFooterVisible,
  getIsMiniCartDrawerVisible,
} from '../../redux/cart/selectors';
import { showMiniCartDrawer, hideMiniCartDrawer } from '../../redux/cart/thunks';
import { getIsVirtualKeyboardVisibleInMobile } from '../../utils';
import { isMobile } from '../../../../../common/utils';
import styles from './MenuFooter.module.scss';
import MiniMumOrder from '../MiniMumOrder';
import { reviewCart } from '../../redux/common/thunks';

const MenuFooter = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  // for whether display cart footer display
  const isCartFooterVisible = useSelector(getIsCartFooterVisible);
  // get virtual keyboard visibility status
  const isVirtualKeyboardVisible = useSelector(getIsVirtualKeyboardVisible);
  // is enable pay later
  const isEnablePayLater = useSelector(getIsEnablePayLater);
  // get cart quantity
  const cartQuantity = useSelector(getCartQuantity);
  // get formatted cart total, for example: "RM 10.00"
  const cartFormattedSubtotal = useSelector(getCartItemsFormattedSubtotal);
  // is mini cart drawer visible
  const isMiniCartDrawerVisible = useSelector(getIsMiniCartDrawerVisible);
  // minimum Consumption formatted price, for example: "RM 30.00"
  const minimumConsumptionFormattedPrice = useSelector(getMinimumConsumptionFormattedPrice);
  // is fulfill minimum Consumption, for whether display minimum consumption
  const isFulfillMinimumConsumption = useSelector(getIsFulfillMinimumConsumption);
  // is able to review cart
  const isAbleToReviewCart = useSelector(getIsAbleToReviewCart);
  // get virtual keyboard visibility status in mobile
  const isVirtualKeyboardVisibleInMobile = getIsVirtualKeyboardVisibleInMobile(isMobile(), isVirtualKeyboardVisible);
  // footer will hide that searching box focused or virtual keyboard is opened in mobile
  if (isVirtualKeyboardVisibleInMobile) {
    return null;
  }

  return (
    <PageFooter zIndex={50}>
      <MiniMumOrder />
      <MenuViewOrderBar />
      {isCartFooterVisible ? (
        <div className="tw-flex tw-p-8 sm:tw-p-8px">
          <div
            className="tw-flex-1 tw-flex tw-items-center tw-justify-center tw-mx-8 sm:tw-mx-8px tw-cursor-default"
            data-test-id="ordering.menu.footer.mini-cart-btn"
            onClick={() => (isMiniCartDrawerVisible ? dispatch(hideMiniCartDrawer()) : dispatch(showMiniCartDrawer()))}
            role="button"
            tabIndex="0"
          >
            <Badge className="tw-bg-red" value={cartQuantity} offset={[12, 4]}>
              <HandbagSimple className="tw-text-5xl" weight="light" />
            </Badge>
            {isEnablePayLater ? null : (
              <span className="tw-px-2 sm:tw-px-2px tw-ml-8 sm:tw-ml-8px tw-font-bold">{cartFormattedSubtotal}</span>
            )}
          </div>
          <Button
            type="primary"
            className={styles.MenuFooterOrderButton}
            disabled={!isAbleToReviewCart}
            data-test-id="ordering.menu.footer.review-cart-btn"
            onClick={() => {
              dispatch(reviewCart());
            }}
          >
            {!isFulfillMinimumConsumption
              ? t('MinMumConsumptionButtonPrompt', { minimumConsumptionFormattedPrice })
              : t('ReviewCart')}
          </Button>
        </div>
      ) : null}
    </PageFooter>
  );
};

MenuFooter.displayName = 'MenuFooter';

export default MenuFooter;
