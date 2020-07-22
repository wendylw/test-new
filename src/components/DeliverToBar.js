import PropTypes from 'prop-types';
import React, { PureComponent } from 'react';
import { Link } from 'react-router-dom';
import Constants from '../utils/constants';
import './DeliverToBar.scss';
import { IconLocation, IconScanner } from './Icons';

class DeliverToBar extends PureComponent {
  handleScannerClicked = () => {
    this.props.backLeftPosition();
  };

  render() {
    const { title, address, className, gotoLocationPage } = this.props;
    const { ROUTER_PATHS } = Constants;
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
            this.handleScannerClicked();
            gotoLocationPage();
          }}
        >
          <label className="deliver-to-entry__label text-uppercase text-weight-bold">{title}</label>
          <div>
            <IconLocation className="icon icon__small icon__gray text-middle" />
            <span className="deliver-to-entry__address text-middle text-opacity text-omit__single-line">{address}</span>
          </div>
        </div>
        <Link to={ROUTER_PATHS.QRSCAN} data-heap-name="site.home.qr-scan-icon">
          <IconScanner className="icon icon__privacy" onClick={this.handleScannerClicked} />
        </Link>
      </section>
    );
  }
}

DeliverToBar.propTypes = {
  className: PropTypes.string,
  title: PropTypes.string,
  address: PropTypes.string,
  gotoLocationPage: PropTypes.func,
};

DeliverToBar.defaultProps = {
  title: '',
  address: '',
  toLocationPage: () => {},
};

export default DeliverToBar;
