import PropTypes from 'prop-types';
import React, { PureComponent } from 'react';
import './DeliverToBar.scss';

class DeliverToBar extends PureComponent {
  render() {
    const { heapName, title, icon, address, className, gotoLocationPage, backLeftPosition, children } = this.props;
    const classList = ['deliver-to-entry flex flex-middle flex-space-between'];

    if (className) {
      classList.push(className);
    }

    return (
      <section className={classList.join(' ')}>
        <div
          className="deliver-to-entry__content"
          data-testid="DeliverToBar"
          data-heap-name={heapName}
          onClick={() => {
            if (backLeftPosition) {
              backLeftPosition();
            }

            gotoLocationPage();
          }}
        >
          <div>
            <label className="deliver-to-entry__label text-size-small text-uppercase text-weight-bolder">{title}</label>
            <div className="flex flex-top">
              {icon}
              <p className="deliver-to-entry__address padding-top-bottom-smaller text-middle text-opacity text-omit__single-line">
                {address}
              </p>
            </div>
          </div>
        </div>
        {children}
      </section>
    );
  }
}

DeliverToBar.propTypes = {
  heapName: PropTypes.string,
  className: PropTypes.string,
  title: PropTypes.string,
  icon: PropTypes.node,
  address: PropTypes.string,
  gotoLocationPage: PropTypes.func,
  backLeftPosition: PropTypes.func,
};

DeliverToBar.defaultProps = {
  title: '',
  address: '',
  icon: null,
  toLocationPage: () => {},
  backLeftPosition: () => {},
};

export default DeliverToBar;
