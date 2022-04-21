import React from 'react';
import PropTypes from 'prop-types';
import { Star } from 'phosphor-react';
import styles from './RatingTag.module.scss';

const RatingTag = ({ rating, className }) => {
  const classNameList = [styles.RatingTagContainer, 'text-size-reset'];

  if (className) {
    classNameList.push(className);
  }

  return (
    <li className={classNameList.join(' ')}>
      <Star className={styles.RatingTagIcon} weight="fill" size={16} />
      <span className="sm:tw-mx-4px tw-mx-4 sm:tw-my-2px tw-my-2 tw-text-sm tw-leading-normal">{rating}</span>
    </li>
  );
};

RatingTag.displayName = 'RatingTag';

RatingTag.propTypes = {
  rating: PropTypes.string,
  className: PropTypes.string,
};

RatingTag.defaultProps = {
  rating: '',
  className: '',
};

export default RatingTag;
