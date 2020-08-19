import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { IconLeftArrow } from './Icons';
import withDataAttributes from './withDataAttributes';
import './DeliverToBar.scss';

class DeliverToBar extends Component {
  render() {
    const {
      title,
      icon,
      backIcon,
      content,
      extraInfo,
      className,
      showBackButton,
      gotoLocationPage,
      backLeftPosition,
      deliverToBarRef,
      dataAttributes,
      children,
    } = this.props;
    const classList = ['deliver-to-entry flex flex-space-between sticky-wrapper'];

    if (className) {
      classList.push(className);
    }

    return (
      <section ref={deliverToBarRef} className={classList.join(' ')}>
        <div
          className="deliver-to-entry__content"
          {...dataAttributes}
          data-testid="DeliverToBar"
          onClick={() => {
            if (backLeftPosition) {
              backLeftPosition();
            }

            gotoLocationPage();
          }}
        >
          {backIcon}
          <div className={showBackButton ? '' : 'padding-left-right-smaller'}>
            {title ? (
              <label className="deliver-to-entry__label margin-smallest text-size-small text-uppercase text-weight-bolder">
                {title}
              </label>
            ) : null}
            <div className="flex flex-top">
              {icon}
              <div className="deliver-to-entry__detail-container">
                <p className="deliver-to-entry__base-info padding-top-bottom-smaller text-middle text-opacity text-omit__single-line">
                  {content}
                </p>
                {extraInfo ? (
                  <p className="text-size-small text-weight-bolder padding-top-bottom-smaller text-omit__single-line">
                    {extraInfo}
                  </p>
                ) : null}
              </div>
            </div>
          </div>
        </div>
        {children}
      </section>
    );
  }
}

DeliverToBar.propTypes = {
  deliverToBarRef: PropTypes.any,
  className: PropTypes.string,
  title: PropTypes.string,
  icon: PropTypes.node,
  content: PropTypes.string,
  extraInfo: PropTypes.string,
  showBackButton: PropTypes.bool,
  gotoLocationPage: PropTypes.func,
  backLeftPosition: PropTypes.func,
};

DeliverToBar.defaultProps = {
  title: '',
  content: '',
  navBackUrl: '',
  extraInfo: '',
  icon: null,
  showBackButton: false,
  toLocationPage: () => {},
  backLeftPosition: () => {},
};

export default withDataAttributes(DeliverToBar);
