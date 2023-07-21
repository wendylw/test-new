/* eslint-disable react/no-array-index-key */
/* eslint-disable react/forbid-prop-types */
import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import _get from 'lodash/get';
import _isEmpty from 'lodash/isEmpty';
import VendorImage from '../../../../../components/VendorImage';
import RibbonBadge from '../../../../../components/RibbonBadge';
import RatingTag from '../../../../../components/RatingTag';
import PromoTag from '../../../../../components/PromoTag';
import LowPriceTag from '../../../../../components/LowPriceTag';
import styles from './StoreCard.module.scss';

const StoreCard = ({ store, onClick }) => {
  const { t } = useTranslation('SiteHome');

  const name = useMemo(() => _get(store, 'name', ''), [store]);
  const avatar = useMemo(() => _get(store, 'avatar', ''), [store]);
  const isOpen = useMemo(() => _get(store, 'isOpen', false), [store]);
  const enablePreOrder = useMemo(() => _get(store, 'enablePreOrder', false), [store]);
  const enableCashback = useMemo(() => _get(store, 'enableCashback', false), [store]);
  const promoTag = useMemo(() => _get(store, 'promoTag', ''), [store]);
  const rating = useMemo(() => _get(store, 'reviewInfo.rating', ''), [store]);
  const cashbackRate = useMemo(() => _get(store, 'cashbackRate', 0), [store]);
  const hasLowestPrice = useMemo(() => _get(store, 'isLowestPrice', false), [store]);
  const cashbackRatePercentage = useMemo(() => Math.round((Number(cashbackRate) || 0) * 100), [cashbackRate]);
  const isFreeDeliveryAvailable = useMemo(() => _get(store, 'showFreeDeliveryTag', false), [store]);
  const isCashbackAvailable = useMemo(() => enableCashback && cashbackRate, [enableCashback, cashbackRate]);
  const isStoreClosed = useMemo(() => !(isOpen || enablePreOrder), [isOpen, enablePreOrder]);
  const shouldShowPreOrderTag = useMemo(() => !isOpen && enablePreOrder, [isOpen, enablePreOrder]);

  const ribbonBadges = useMemo(() => {
    const badges = [];

    badges.push(promoTag ? { title: promoTag, color: '#F04B23' } : null);
    badges.push(shouldShowPreOrderTag ? { title: t('PreOrder'), color: '#0698A8' } : null);

    return badges.filter(badge => badge);
  }, [t, promoTag, shouldShowPreOrderTag]);

  const promoTags = useMemo(() => {
    const tags = [];

    tags.push(isCashbackAvailable ? t('EnabledCashbackShortText', { cashbackRate: cashbackRatePercentage }) : null);
    tags.push(isFreeDeliveryAvailable ? t('FreeDelivery') : null);

    return tags.filter(tag => tag);
  }, [t, isFreeDeliveryAvailable, isCashbackAvailable, cashbackRatePercentage]);

  return (
    <button className={styles.StoreCardContainer} data-test-id="site.home.carousel.store-item" onClick={onClick}>
      <div className={styles.StoreCardImageContainer}>
        {_isEmpty(ribbonBadges) ? null : (
          <div className={styles.StoreCardRibbonBadgeWrapper}>
            {ribbonBadges.map(({ title, color }, idx) => (
              <RibbonBadge key={idx} title={title} color={color} isClosed={isStoreClosed} />
            ))}
          </div>
        )}
        <VendorImage src={avatar} alt={name} isClosed={isStoreClosed} />
        <ol className={styles.StoreCardTagListContainer}>
          {hasLowestPrice && <LowPriceTag className={styles.StoreCardLowPriceTagContainer} />}
          {rating && <RatingTag rating={rating} className={styles.StoreCardRatingTagContainer} />}
        </ol>
      </div>
      <div className={`${styles.StoreCardSummaryContainer} ${isStoreClosed ? 'tw-opacity-40' : ''}`}>
        <h3 className={styles.StoreCardTitle}>{name}</h3>
        {_isEmpty(promoTags) ? null : (
          <ol className={styles.StoreCardPromoTagContainer}>
            {promoTags.map((tag, idx) => (
              <PromoTag key={idx} tagName={tag} className="sm:tw-my-4px tw-my-4 first:sm:tw-mr-4px first:tw-mr-4" />
            ))}
          </ol>
        )}
      </div>
    </button>
  );
};

StoreCard.displayName = 'StoreCard';

StoreCard.propTypes = {
  store: PropTypes.object,
  onClick: PropTypes.func,
};

StoreCard.defaultProps = {
  store: {},
  onClick: () => {},
};

export default StoreCard;
