import PropTypes from 'prop-types';
import React, { PureComponent } from 'react';
import Constants from '../utils/constants';
import './DeliverToBar.scss';
import { IconLocation } from './Icons';

class DeliverToBar extends PureComponent {
  render() {
    const { title, address, className, gotoLocationPage, backLeftPosition, children } = this.props;
    const classList = ['deliver-to-entry flex flex-middle flex-space-between'];

    if (className) {
      classList.push(className);
    }

    return (
      <section className={classList.join(' ')}>
        <div
          className="deliver-to-entry__content"
          data-testid="DeliverToBar"
          data-heap-name="site.home.delivery-bar"
          onClick={() => {
            if (backLeftPosition) {
              backLeftPosition();
            }

            gotoLocationPage();
          }}
        >
          <label className="deliver-to-entry__label text-size-small text-uppercase text-weight-bold">{title}</label>
          <div>
            <IconLocation className="icon icon__smaller text-middle" />
            <span className="deliver-to-entry__address text-middle text-opacity text-omit__single-line">{address}</span>
          </div>
        </div>
        {children}
      </section>
    );
  }
}

DeliverToBar.propTypes = {
  className: PropTypes.string,
  title: PropTypes.string,
  address: PropTypes.string,
  gotoLocationPage: PropTypes.func,
  backLeftPosition: PropTypes.func,
};

DeliverToBar.defaultProps = {
  title: '',
  address: '',
  toLocationPage: () => {},
  backLeftPosition: () => {},
};

export default DeliverToBar;
