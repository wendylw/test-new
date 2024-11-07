import React from 'react';
import PropTypes from 'prop-types';
import { CaretLeft } from 'phosphor-react';
import styles from './PageHeader.module.scss';
import { isWebview } from '../../utils';
import { getClassName } from '../../utils/ui';
import NativeHeader from '../../../components/NativeHeader';

const isInWebview = isWebview();

const PageHeader = props => {
  const {
    className,
    leftContentClassName,
    titleClassName,
    title,
    isShowBackButton,
    onBackArrowClick,
    rightContent,
    isDarkMode,
    nativeStyles,
  } = props;

  return (
    <>
      {isInWebview ? (
        <NativeHeader
          isPage
          isDarkMode={isDarkMode}
          styles={nativeStyles}
          rightContent={rightContent}
          title={title}
          navFunc={onBackArrowClick}
        />
      ) : (
        <header className={`${styles.PageHeaderContainer} ${className}`}>
          <div className={getClassName([styles.PageHeaderLeftContainer, leftContentClassName])}>
            {isShowBackButton && (
              <button
                className={styles.PageHeaderIconWrapper}
                onClick={onBackArrowClick}
                data-test-id="common.page-header.back-btn"
              >
                <CaretLeft size={24} weight="light" />
              </button>
            )}
            <div
              className={getClassName([
                styles.PageHeaderTitle,
                titleClassName,
                isShowBackButton ? null : 'tw-px-16 sm:tw-px-16px',
              ])}
            >
              {title}
            </div>
          </div>
          {rightContent}
        </header>
      )}
    </>
  );
};

PageHeader.displayName = 'PageHeader';

PageHeader.propTypes = {
  className: PropTypes.string,
  leftContentClassName: PropTypes.string,
  titleClassName: PropTypes.string,
  title: PropTypes.string,
  isShowBackButton: PropTypes.bool,
  onBackArrowClick: PropTypes.func,
  rightContent: PropTypes.node,
  isDarkMode: PropTypes.bool,
  nativeStyles: PropTypes.shape({
    backgroundColor: PropTypes.string,
  }),
};

PageHeader.defaultProps = {
  className: '',
  leftContentClassName: '',
  titleClassName: '',
  title: '',
  isShowBackButton: true,
  onBackArrowClick: () => {},
  rightContent: null,
  isDarkMode: false,
  nativeStyles: null,
};

export default PageHeader;
