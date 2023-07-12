import PropTypes from 'prop-types';
import React, { Component } from 'react';
import './DeliverToBar.scss';
import { extractDataAttributes } from '../common/utils';

/**
 * `<DeliverToBar />` is used on the homepage of beepit.com and ordering.
 *
 * A entry of search location and delivery details
 */
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
      children,
    } = this.props;
    const classList = ['deliver-to-entry flex flex-space-between sticky-wrapper'];

    if (className) {
      classList.push(className);
    }

    return (
      <section ref={deliverToBarRef} className={classList.join(' ')}>
        {showBackButton ? backIcon : null}
        <div
          className="deliver-to-entry__content"
          {...extractDataAttributes(this.props)}
          data-testid="DeliverToBar"
          onClick={() => {
            if (backLeftPosition) {
              backLeftPosition();
            }

            gotoLocationPage();
          }}
        >
          <div className={showBackButton ? '' : 'padding-left-right-smaller'}>
            {title ? (
              <label className="deliver-to-entry__label margin-smaller text-size-small text-uppercase text-weight-bolder">
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
                  <p className=" deliver-to-entry__remarks padding-top-bottom-smaller text-size-small text-weight-bolder text-uppercase text-omit__single-line">
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

DeliverToBar.displayName = 'DeliverToBar';

DeliverToBar.propTypes = {
  deliverToBarRef: PropTypes.any,
  className: PropTypes.string,
  title: PropTypes.string,
  icon: PropTypes.node,
  backIcon: PropTypes.node,
  content: PropTypes.string,
  extraInfo: PropTypes.string,
  showBackButton: PropTypes.bool,
  gotoLocationPage: PropTypes.func,
  backLeftPosition: PropTypes.func,
};

DeliverToBar.defaultProps = {
  title: '',
  content: '',
  extraInfo: '',
  icon: null,
  backIcon: null,
  showBackButton: false,
  backLeftPosition: () => {},
  gotoLocationPage: () => {},
};

export default DeliverToBar;
