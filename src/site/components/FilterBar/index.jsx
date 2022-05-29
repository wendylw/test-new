import React from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { Swiper, SwiperSlide } from 'swiper/react';
import ChipSelector from './components/ChipSelector';
import styles from './FilterBar.module.scss';

const FilterBar = ({ className, categories, shouldShowResetButton, onResetButtonClick, onCategoryButtonClick }) => {
  const { t } = useTranslation();
  const classNameList = [styles.FilterBarContainer, 'text-size-reset'];

  if (className) {
    classNameList.push(className);
  }

  return (
    <div className="tw-relative">
      {shouldShowResetButton && (
        <button
          className={styles.FilterBarButtonWrapper}
          type="text"
          onClick={onResetButtonClick}
          data-heap-name="site.common.filter.reset-filter-btn"
        >
          {t('Reset')}
        </button>
      )}
      <Swiper className={classNameList.join(' ')} slidesPerView="auto" grabCursor="true">
        {categories.map(category => (
          <SwiperSlide key={category.id} className={styles.FilterBarSwiperSlideWrapper}>
            <ChipSelector category={category} onClick={onCategoryButtonClick} />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

FilterBar.displayName = 'FilterBar';

FilterBar.propTypes = {
  className: PropTypes.string,
  categories: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string,
      name: PropTypes.string,
      type: PropTypes.string,
    })
  ),
  shouldShowResetButton: PropTypes.bool,
  onResetButtonClick: PropTypes.func,
  onCategoryButtonClick: PropTypes.func,
};

FilterBar.defaultProps = {
  className: '',
  categories: [],
  shouldShowResetButton: false,
  onResetButtonClick: () => {},
  onCategoryButtonClick: () => {},
};

export default FilterBar;
