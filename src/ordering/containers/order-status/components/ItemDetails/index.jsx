import PropTypes from 'prop-types';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import CurrencyNumber from '../../../../components/CurrencyNumber';
import { SHIPPING_TYPES } from '../../../../../common/utils/constants';
import './index.scss';

const itemPropTypes = PropTypes.shape({
  id: PropTypes.string,
  title: PropTypes.string,
  displayPrice: PropTypes.number,
  quantity: PropTypes.number,
  variationTexts: PropTypes.arrayOf(PropTypes.string),
  isTakeaway: PropTypes.bool,
});

const ItemDetails = ({ item, shippingType }) => {
  const { t } = useTranslation('OrderingThankYou');
  const { id, title, displayPrice, quantity, variationTexts, isTakeaway } = item;
  const shouldShowProductVariations = useMemo(() => variationTexts && variationTexts[0], [variationTexts]);
  const shouldShowTakeawayVariant = useMemo(() => shippingType === SHIPPING_TYPES.DINE_IN && isTakeaway, [
    isTakeaway,
    shippingType,
  ]);

  return (
    <li key={`title-${id}`} className="flex flex-middle flex-space-between">
      <div className="flex flex-top">
        <span className="padding-top-bottom-small flex__shrink-fixed text-opacity">{quantity} x</span>
        <div className="padding-small">
          <span className="item-details__title text-opacity">{title}</span>
          {shouldShowProductVariations && (
            <p className="margin-top-bottom-smaller">
              <span className="item-details__product-variations">{variationTexts.join(', ')}</span>
            </p>
          )}
          {shouldShowTakeawayVariant && (
            <div className="margin-top-bottom-smaller">
              <span className="item-details__takeaway-variant">{t('TakeAway')}</span>
            </div>
          )}
        </div>
      </div>
      <CurrencyNumber
        className="padding-top-bottom-small flex__shrink-fixed text-opacity"
        money={displayPrice * quantity}
      />
    </li>
  );
};

ItemDetails.displayName = 'ItemDetails';

ItemDetails.propTypes = {
  item: itemPropTypes,
  shippingType: PropTypes.string,
};

ItemDetails.defaultProps = {
  item: {},
  shippingType: '',
};

export default ItemDetails;
