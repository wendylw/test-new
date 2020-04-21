import React, { PureComponent } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { IconLocation, IconCropFree } from './Icons';
import Constants from '../utils/constants';
import './DeliverToBar.scss';

class DeliverToBar extends PureComponent {
  render() {
    const { title, address, className, gotoLocationPage } = this.props;
    const { ROUTER_PATHS } = Constants;
    const classList = ['deliver-to-entry flex flex-middle flex-space-between'];

    if (className) {
      classList.push(className);
    }

    return (
      <section className={classList.join(' ')}>
        <div className="deliver-to-entry__content" onClick={() => gotoLocationPage()}>
          <label className="deliver-to-entry__label text-uppercase text-weight-bold">{title}</label>
          <div>
            <IconLocation className="icon icon__small icon__gray text-middle" />
            <span className="deliver-to-entry__address text-middle text-opacity text-omit__single-line">{address}</span>
          </div>
        </div>
        <Link to={ROUTER_PATHS.QRSCAN}>
          <IconCropFree className="icon icon__privacy" />
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
