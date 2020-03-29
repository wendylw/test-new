import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { IconLocation, IconEdit } from './Icons';

class DeliverToBar extends PureComponent {
  render() {
    const { title, address, className, gotoLocationPage } = this.props;
    const classList = ['deliver-to-entry flex flex-middle flex-space-between base-box-shadow absolute-wrapper'];

    if (className) {
      classList.push(className);
    }

    return (
      <section className={classList.join(' ')} onClick={() => gotoLocationPage()}>
        <div className="deliver-to-entry__content">
          <label className="deliver-to-entry__label text-uppercase text-weight-bold">{title}</label>
          <div>
            <IconLocation className="icon icon__small icon__gray text-middle" />
            <span className="deliver-to-entry__address text-opacity text-middle">{address}</span>
          </div>
        </div>
        <IconEdit className="icon icon__small icon__privacy text-middle" />
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
