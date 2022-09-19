import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { Star } from 'phosphor-react';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import styles from './Rating.module.scss';

const STAR_SIZES = [16, 24, 36, 48];

const Rating = ({ initialStarNum, totalStarNum, showText, starSize, onRatingChanged }) => {
  const { t } = useTranslation();

  const [rating, setRating] = useState(initialStarNum);

  const handleUpdateRating = useCallback(
    key => {
      setRating(key);
    },
    [setRating]
  );

  useEffect(() => onRatingChanged(rating), [rating, onRatingChanged]);

  const text = useMemo(() => {
    switch (rating) {
      case 5:
        return t('Great');
      case 4:
        return t('Good');
      case 3:
        return t('Okie');
      case 2:
        return t('Bad');
      case 1:
        return t('Terrible');
      default:
        return '';
    }
  }, [rating, t]);

  return (
    <div className={styles.RatingContainer}>
      <ul className={styles.Rating}>
        {Array(totalStarNum)
          .fill(null)
          .map((item, key) => (
            // eslint-disable-next-line react/no-array-index-key
            <li key={`star-${key}`}>
              <Star
                className={`sm:tw-m-4px tw-m-4 ${rating && key < rating ? 'tw-text-yellow' : 'tw-text-gray-600'}`}
                weight={rating && key < rating ? 'fill' : 'light'}
                size={starSize}
                onClick={() => handleUpdateRating(key + 1)}
              />
            </li>
          ))}
      </ul>
      {showText && <div className="tw-text-lg tw-leading-relaxed tw-font-black">{text}</div>}
    </div>
  );
};

Rating.propTypes = {
  onRatingChanged: PropTypes.func,
  initialStarNum: PropTypes.number,
  totalStarNum: PropTypes.number,
  showText: PropTypes.bool,
  starSize: PropTypes.oneOf(Object.values(STAR_SIZES)),
};

Rating.defaultProps = {
  onRatingChanged: () => {},
  initialStarNum: 0,
  totalStarNum: 5,
  showText: true,
  starSize: 48,
};

Rating.displayName = 'Rating';

export default Rating;
