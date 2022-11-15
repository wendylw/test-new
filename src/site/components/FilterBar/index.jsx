import React from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { Swiper, SwiperSlide } from 'swiper/react';
import { CaretDown, FunnelSimple } from 'phosphor-react';
import ChipSelector from './components/ChipSelector';
import { DISPLAY_ICON_TYPES } from '../../../utils/constants';
import 'swiper/swiper.scss';
import styles from './FilterBar.module.scss';

const FilterBar = ({
  className,
  categories,
  shouldShowResetButton,
  onSwiper,
  onResetButtonClick,
  onCategoryButtonClick,
}) => {
  const { t } = useTranslation();
  const classNameList = [styles.FilterBarContainer, 'text-size-reset'];

  if (className) {
    classNameList.push(className);
  }

  return (
    <div className={classNameList.join(' ')}>
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
      <Swiper
        slidesPerView="auto"
        grabCursor="true"
        onSwiper={onSwiper}
        className={shouldShowResetButton ? '' : 'sm:tw-pl-16px tw-pl-16'}
      >
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
  onSwiper: PropTypes.func,
  onResetButtonClick: PropTypes.func,
  onCategoryButtonClick: PropTypes.func,
};

FilterBar.defaultProps = {
  className: '',
  categories: [],
  shouldShowResetButton: false,
  onSwiper: () => {},
  onResetButtonClick: () => {},
  onCategoryButtonClick: () => {},
};

export default FilterBar;
