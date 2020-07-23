import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { IconLeftArrow } from './Icons';
import './DeliverToBar.scss';

class DeliverToBar extends Component {
  render() {
    const {
      heapContentName,
      heapBackButtonName,
      title,
      icon,
      navBackUrl,
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
        <div
          className="deliver-to-entry__content"
          data-testid="DeliverToBar"
          data-heap-name={heapContentName}
          onClick={() => {
            if (backLeftPosition) {
              backLeftPosition();
            }

            gotoLocationPage();
          }}
        >
          {showBackButton ? (
            <IconLeftArrow
              className="icon icon__big icon__default text-middle flex__shrink-fixed"
              data-heap-name={heapBackButtonName}
              onClick={event => {
                event.preventDefault();
                window.location.href = navBackUrl;
                event.stopPropagation();
              }}
            />
          ) : null}
          <div className={showBackButton ? '' : 'padding-left-right-smaller'}>
            <label className="deliver-to-entry__label margin-smallest text-size-small text-uppercase text-weight-bolder">
              {title}
            </label>
            <div className="flex flex-top">
              {icon}
              <div className="deliver-to-entry__detail-container">
                <p className="deliver-to-entry__content padding-top-bottom-smaller text-middle text-opacity text-omit__single-line">
                  {content}
                </p>
                {extraInfo ? (
                  <p className="text-size-small padding-top-bottom-smaller text-weight-bolder text-omit__single-line">
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
  heapContentName: PropTypes.string,
  heapBackButtonName: PropTypes.string,
  className: PropTypes.string,
  title: PropTypes.string,
  icon: PropTypes.node,
  content: PropTypes.string,
  navBackUrl: PropTypes.string,
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

export default DeliverToBar;
