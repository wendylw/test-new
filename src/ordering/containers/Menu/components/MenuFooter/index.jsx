import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { HandbagSimple } from 'phosphor-react';
import Button from '../../../../../common/components/Button';
import PageFooter from '../../../../../common/components/PageFooter';
import Badge from '../../../../../common/components/Badge';
import MenuViewOrderBar from './MenuViewOrderBar';
import {
  getCartQuantity,
  getCartItemsFormattedSubtotal,
  getIsFulfillMinimumConsumption,
  getMinimumConsumptionFormattedPrice,
  getIsEnablePayLater,
  getIsCartFooterVisible,
  getIsMiniCartDrawerVisible,
  getIsAbleToReviewCart,
  // getFormattedDiffPriceOnFulfillMinimumConsumption,
} from '../../redux/cart/selectors';
import { reviewCart, showMiniCartDrawer, hideMiniCartDrawer } from '../../redux/cart/thunks';
import styles from './MenuFooter.module.scss';

const MenuFooter = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  // for whether display cart footer display
  const isCartFooterVisible = useSelector(getIsCartFooterVisible);
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
  useEffect(() => {
    dispatch(hideMiniCartDrawer());
  }, [isCartFooterVisible]);

  return (
    <PageFooter zIndex={50}>
      <MenuViewOrderBar />
      {isCartFooterVisible ? (
        <div className="tw-flex tw-py-8 sm:tw-py-8px tw-px-20 sm:tw-px-20px">
          <div
            className="tw-flex-1 tw-flex tw-items-center tw-cursor-default tw-justify-center"
            onClick={() => (isMiniCartDrawerVisible ? dispatch(hideMiniCartDrawer()) : dispatch(showMiniCartDrawer()))}
            role="button"
            tabIndex="0"
          >
            <Badge className="tw-bg-red" value={cartQuantity} offset={[12, 4]}>
              <HandbagSimple className="tw-text-5xl" weight="light" />
            </Badge>
            {isEnablePayLater ? null : (
              <span className="tw-px-6 sm:tw-px-6px tw-ml-6 sm:tw-ml-6px tw-font-bold">{cartFormattedSubtotal}</span>
            )}
          </div>
          <Button
            onClick={() => {
              dispatch(reviewCart());
            }}
            className={styles.MenuFooterOrderButton}
            type="primary"
            disabled={!isAbleToReviewCart}
          >
            {isFulfillMinimumConsumption
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
