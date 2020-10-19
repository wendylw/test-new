import React from 'react';
import PropTypes from 'prop-types';
import { IconLeftArrow } from '../../components/Icons';

class ModalPageLayout extends React.Component {
  render() {
    const { children, title, sectionRef } = this.props;

    return (
      <main ref={sectionRef} className="fixed-wrapper fixed-wrapper__main">
        <header className="header flex flex-space-between flex-middle sticky-wrapper border__bottom-divider">
          <div>
            <IconLeftArrow
              className="icon icon__big icon__default text-middle"
              onClick={this.props.onGoBack}
              data-heap-name="site.common.back-btn"
            />
            {title ? (
              <h2 className="header__title text-middle text-size-big text-weight-bolder text-omit__single-line">
                {title}
              </h2>
            ) : null}
          </div>
        </header>
        {children}
      </main>
    );
  }
}

ModalPageLayout.propTypes = {
  onGoBack: PropTypes.func.isRequired,
};

export default ModalPageLayout;
