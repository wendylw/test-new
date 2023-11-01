import React, { useMemo } from 'react';
import { useDispatch } from 'react-redux';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import QuantityAdjuster from '../../../../../common/components/QuantityAdjuster';
import { ObjectFitImage } from '../../../../../common/components/Image';
import Button from '../../../../../common/components/Button';
import Tag from '../../../../../common/components/Tag';
import { increaseCartItemQuantity, decreaseCartItemQuantity, removeCartItem } from '../../redux/cart/thunks';
import styles from './MiniCart.module.scss';

const CartItemOperator = ({
  id,
  quantity,
  inventory,
  isLowStock,
  isOutOfStock,
  isAbleToIncreaseQuantity,
  isAbleToDecreaseQuantity,
}) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  return (
    <>
      {isOutOfStock ? (
        <Button
          type="text"
          theme="danger"
          className={styles.removeItemButton}
          data-test-id="ordering.menu.mini-cart.remove-item-btn"
          onClick={() => {
            dispatch(removeCartItem({ cartItemId: id }));
          }}
        >
          {t('RemoveItem')}
        </Button>
      ) : (
        <div className="tw-flex tw-flex-col tw-items-center tw-flex-shrink-0">
          <QuantityAdjuster
            className="tw-px-2 sm:tw-px-2px tw-mt-8 sm:tw-mt-8px"
            data-test-id="ordering.menu.mini-cart.quantity-adjuster"
            decreaseDisabled={!isAbleToDecreaseQuantity}
            increaseDisabled={!isAbleToIncreaseQuantity}
            onChange={delta => {
              const op = delta > 0 ? increaseCartItemQuantity : decreaseCartItemQuantity;

              dispatch(op({ cartItemId: id }));
            }}
            value={quantity}
          />
          {isLowStock ? (
            <span className="tw-mt-6 sm:tw-mt-6px tw-text-sm tw-text-red tw-font-bold text-leading-loose">
              {t('InventoryItemsLeft', { inventory })}
            </span>
          ) : null}
        </div>
      )}
    </>
  );
};

CartItemOperator.displayName = 'CartItemOperator';
CartItemOperator.propTypes = {
  id: PropTypes.string,
  quantity: PropTypes.number,
  inventory: PropTypes.number,
  isLowStock: PropTypes.bool,
  isOutOfStock: PropTypes.bool,
  isAbleToDecreaseQuantity: PropTypes.bool,
  isAbleToIncreaseQuantity: PropTypes.bool,
};
CartItemOperator.defaultProps = {
  id: null,
  quantity: 0,
  inventory: 0,
  isLowStock: false,
  isOutOfStock: false,
  isAbleToDecreaseQuantity: false,
  isAbleToIncreaseQuantity: false,
};

const CartItem = ({ item, isDineType }) => {
  const { t } = useTranslation();
  const itemClassName = [styles.cartItem];
  const shouldShowTakeawayVariant = useMemo(() => isDineType && item.isTakeaway, [isDineType, item.isTakeaway]);

  if (item.isOutOfStock) {
    itemClassName.push(styles.cartItemOutStock);
  }

  return (
    <li className={itemClassName.join(' ')}>
      <div className={styles.cartItemInfoContent}>
        <div className="tw-flex-1">
          <h4 className={styles.cartItemTitle}>{item.title}</h4>
          {item.variationTitles && item.variationTitles.length > 0 ? (
            <p className={styles.cartItemDescription}>{item.variationTitles.join(', ')}</p>
          ) : null}
          {shouldShowTakeawayVariant && (
            <div className="tw-px-2 sm:tw-px-2px tw-my-2 sm:tw-my-2px">
              <span className={styles.cartItemTakeVariant}>{t('TakeAway')}</span>
            </div>
          )}
          <div className="tw-flex tw-items-start tw-justify-between">
            <div>
              <div className="tw-flex tw-items-center tw-my-8 sm:tw-my-8px">
                <span className={`${styles.cartItemPrice} tw-px-2 sm:tw-px-2px tw-leading-relaxed`}>
                  {item.formattedDisplayPrice}
                </span>
                {item.formattedOriginalDisplayPrice && (
                  <span
                    className={`${styles.cartItemPrice} tw-px-2 sm:tw-px-2px tw-leading-relaxed tw-line-through tw-text-gray-900 tw-opacity-40`}
                  >
                    {item.formattedOriginalDisplayPrice}
                  </span>
                )}
                {item.isOutOfStock ? (
                  <Tag className="tw-mx-8 sm:tw-mx-8px tw-font-bold tw-uppercase">{t('SoldOut')}</Tag>
                ) : null}
              </div>

              {item.comments ? <p className={styles.cartItemComments}>{item.comments}</p> : null}
            </div>

            {item.image ? null : (
              <CartItemOperator
                id={item.id}
                quantity={item.quantity}
                inventory={item.inventory}
                isLowStock={item.isLowStock}
                isOutOfStock={item.isOutOfStock}
                isAbleToIncreaseQuantity={item.isAbleToIncreaseQuantity}
                isAbleToDecreaseQuantity={item.isAbleToDecreaseQuantity}
              />
            )}
          </div>
        </div>

        {item.image ? (
          <div className="tw-flex-shrink-0 tw-min-w-1.5/10 tw-flex tw-flex-col tw-items-end">
            <div className={styles.cartItemImageContainer}>
              <ObjectFitImage className="tw-text-right tw-rounded-sm" src={item.image} />
            </div>

            <CartItemOperator
              id={item.id}
              quantity={item.quantity}
              inventory={item.inventory}
              isLowStock={item.isLowStock}
              isOutOfStock={item.isOutOfStock}
              isAbleToIncreaseQuantity={item.isAbleToIncreaseQuantity}
              isAbleToDecreaseQuantity={item.isAbleToDecreaseQuantity}
            />
          </div>
        ) : null}
      </div>
    </li>
  );
};

CartItem.displayName = 'CartItem';
CartItem.propTypes = {
  // eslint-disable-next-line react/forbid-prop-types
  item: PropTypes.object,
  isDineType: PropTypes.bool,
};
CartItem.defaultProps = {
  // eslint-disable-next-line react/forbid-prop-types
  item: {},
  isDineType: false,
};

export default CartItem;
