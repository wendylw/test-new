import React from 'react';
import PropTypes from 'prop-types';
import { CaretLeft } from 'phosphor-react';
import styles from './ModalPageLayout.module.scss';

class ModalPageLayout extends React.Component {
  render() {
    const { children, title, sectionRef, className } = this.props;

    const classNameList = [styles.ModalPageLayoutHeaderWrapper];

    if (className) {
      classNameList.push(className);
    }

    return (
      <main ref={sectionRef} className="fixed-wrapper fixed-wrapper__main">
        <header className={classNameList.join(' ')}>
          <button
            className={styles.ModalPageLayoutIconWrapper}
            onClick={this.props.onGoBack}
            data-heap-name="site.common.back-btn"
          >
            <CaretLeft size={24} weight="light" />
          </button>
          {title ? <h2 className={styles.ModalPageLayoutTitle}>{title}</h2> : null}
        </header>
        {children}
      </main>
    );
  }
}
ModalPageLayout.displayName = 'ModalPageLayout';

ModalPageLayout.propTypes = {
  onGoBack: PropTypes.func.isRequired,
};

export default ModalPageLayout;
