import React from 'react';
import PropTypes from 'prop-types';
import styles from './PageHeader.module.scss';
import { isWebview } from '../../utils';
import NativeHeader from '../../../components/NativeHeader';
import BackArrow from '../../../images/back-arrow-header.svg';
import PowerByBeepLogo from '../../../images/powered-by-beep-logo.svg';

const isInWebview = isWebview();

const PageHeader = props => {
  const { className, style, title, isShowBackButton, handleGoBack, rightContent } = props;

  const leftContentForWebHeader = () => {
    if (isShowBackButton) {
      return <img className={styles.MenuHeaderBackArrow} src={BackArrow} alt="" onClick={handleGoBack} />;
    }

    return <img className={styles.MenuHeaderLogo} src={PowerByBeepLogo} alt="" />;
  };

  return (
    <>
      {isInWebview ? (
        <NativeHeader isPage rightContent={rightContent} title={title} navFunc={handleGoBack} />
      ) : (
        <header className="tw-flex tw-justify-between tw-items-center tw-border-0 tw-border-b tw-border-solid tw-border-gray-200">
          <div className={styles.MenuHeaderLeftContainer}>
            {leftContentForWebHeader()}
            <div className={styles.MenuHeaderTitle}>{title}</div>
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
  // eslint-disable-next-line react/forbid-prop-types
  style: PropTypes.object,
  title: PropTypes.string,
  isShowBackButton: PropTypes.bool,
  handleGoBack: PropTypes.func,
  rightContent: PropTypes.node,
};

PageHeader.defaultProps = {
  className: '',
  style: {},
  title: '',
  isShowBackButton: true,
  handleGoBack: () => {},
  rightContent: null,
};

export default PageHeader;
