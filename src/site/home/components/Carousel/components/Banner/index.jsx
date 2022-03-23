/* eslint-disable react/forbid-prop-types */
import React from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { CaretRight } from 'phosphor-react';

const Banner = ({ title, onClick }) => {
  const { t } = useTranslation('SiteHome');

  return (
    <div className="tw-flex tw-justify-between tw-items-center sm:tw-pl-16px tw-pl-16 sm:tw-pr-8px tw-pr-8 sm:tw-py-8px tw-py-8 tw-w-full">
      <h3 className="tw-flex-grow tw-font-bold tw-text-xl tw-leading-normal tw-truncate">{title}</h3>
      <button
        className="tw-flex tw-items-center tw-flex-shrink-0 tw-border-none tw-outline-none tw-p-0 tw-m-0 tw-cursor-pointer tw-bg-transparent"
        data-heap-name="site.home.carousel.see-all-btn"
        onClick={onClick}
      >
        <span className="tw-text-base tw-text-gray-700 tw-leading-relaxed sm:tw-pr-2px tw-pr-2 sm:tw-pl-20px tw-pl-20">
          {t('SeeAll')}
        </span>
        <CaretRight className="tw-text-gray-600 sm:tw-m-2px tw-m-2" />
      </button>
    </div>
  );
};

Banner.displayName = 'Banner';

Banner.propTypes = {
  title: PropTypes.string,
  onClick: PropTypes.func,
};

Banner.defaultProps = {
  title: '',
  onClick: () => {},
};

export default Banner;
