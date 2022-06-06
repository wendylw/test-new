import React from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { Swiper, SwiperSlide } from 'swiper/react';
import { CaretDown, FunnelSimple } from 'phosphor-react';
import ChipSelector from './components/ChipSelector';
import { DISPLAY_ICON_TYPES } from '../../../utils/constants';
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
            <ChipSelector
              category={category}
              left={
                category.displayInfo.icons.includes(DISPLAY_ICON_TYPES.FUNNEL_SIMPLE) && (
                  <FunnelSimple size={16} weight="light" />
                )
              }
              right={
                category.displayInfo.icons.includes(DISPLAY_ICON_TYPES.CARET_DOWN) && (
                  <CaretDown size={16} weight="light" className="tw-text-gray-600" />
                )
              }
              onClick={onCategoryButtonClick}
            >
              <span className="tw-text-left tw-text-base tw-leading-relaxed tw-whitespace-nowrap">
                {category.displayInfo.name}
              </span>
            </ChipSelector>
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
      selected: PropTypes.bool,
      displayInfo: PropTypes.shape({
        name: PropTypes.string,
        icons: PropTypes.arrayOf(PropTypes.string),
      }),
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
