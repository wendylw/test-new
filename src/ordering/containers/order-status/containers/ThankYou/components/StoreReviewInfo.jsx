import React from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import Rating from '../../../components/Rating';
import IconStoreReview from '../../../../../../images/icon-store-review.svg';
import './StoreReviewInfo.scss';

function StoreReviewInfo({ rating, onRatingChanged }) {
  const { t } = useTranslation('OrderingThankYou');

  return (
    <div className="store-review-info__container card text-center margin-small">
      <div className="padding-small">
        <h2 className="flex flex-middle flex-center margin-top-bottom-small text-line-height-base">
          <img src={IconStoreReview} className="icon icon__small" alt="Beep Store Review" />
          <span className="text-size-big text-weight-bolder padding-left-right-smaller">
            {t('StoreReviewCardTitle')}
          </span>
        </h2>
        <p className="margin-top-bottom-small">{t('StoreReviewCardDescription')}</p>
        <Rating
          className="padding-top-bottom-smaller"
          initialStarNum={rating}
          showText={false}
          onRatingChanged={onRatingChanged}
        />
      </div>
    </div>
  );
}

StoreReviewInfo.displayName = 'StoreReviewInfo';

StoreReviewInfo.propTypes = {
  rating: PropTypes.number,
  onRatingChanged: PropTypes.func,
};

StoreReviewInfo.defaultProps = {
  rating: 0,
  onRatingChanged: () => {},
};

export default StoreReviewInfo;
