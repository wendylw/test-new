import React from 'react';
import PropTypes from 'prop-types';
import styles from './PageHeader.module.scss';
import { isWebview } from '../../utils';
import NativeHeader from '../../../components/NativeHeader';
import BackArrow from '../../../images/back-arrow-header.svg';

const isInWebview = isWebview();

const PageHeader = props => {
  const { className, title, isShowBackButton, onBackArrowClick, rightContent } = props;

  return (
    <>
      {isInWebview ? (
        <NativeHeader isPage rightContent={rightContent} title={title} navFunc={onBackArrowClick} />
      ) : (
        <header className={`${styles.PageHeaderContainer} ${className}`}>
          <div className={styles.PageHeaderLeftContainer}>
            {isShowBackButton && (
              <img className={styles.PageHeaderBackArrow} src={BackArrow} alt="" onClick={onBackArrowClick} />
            )}
            <div className={styles.PageHeaderTitle}>{title}</div>
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
  title: PropTypes.string,
  isShowBackButton: PropTypes.bool,
  onBackArrowClick: PropTypes.func,
  rightContent: PropTypes.node,
};

PageHeader.defaultProps = {
  className: '',
  title: '',
  isShowBackButton: true,
  onBackArrowClick: () => {},
  rightContent: null,
};

export default PageHeader;
