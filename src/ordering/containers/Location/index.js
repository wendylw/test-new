import React, { Component } from 'react';
import { withTranslation } from 'react-i18next';
import Header from '../../../components/Header';
import { IconPin, IconAdjust } from '../../../components/Icons';
import DeliveryErrorImage from '../../../images/delivery-error.png';
import { getCurrentAddress } from './utils';

class Location extends Component {
  state = {
    address: '',
  };

  componentDidMount = async () => {
    // will show prompt of permission once entry the page
    await this.tryGeolocation();
  };

  tryGeolocation = async () => {
    try {
      // getCurrentAddress with fire a permission prompt
      const { address } = await getCurrentAddress();
      // todo: save into locale storage for sharing user device address between pages
      this.setState({
        address,
      });
    } catch (e) {
      console.error(e);
      alert(`error found, address is not identified, use empty`);
    }
  };

  render() {
    const { t } = this.props;

    return (
      <section className="table-ordering__location">
        <Header className="has-right" isPage={true} title={t('DeliverTo')} />
        <div className="location-page__info">
          <form className="location-page__form">
            <div className="input-group outline flex flex-middle flex-space-between border-radius-base">
              <i className="location-page__icon-pin" onClick={this.tryGeolocation}>
                <IconPin />
              </i>
              <input
                className="input input__block"
                type="text"
                defaultValue={this.state.address}
                onChange={event => {
                  console.log('typed:', event.currentTarget.value);
                  this.setState({
                    address: event.currentTarget.value,
                  });
                }}
              />
            </div>
          </form>
          <address className="location-page__address item border__bottom-divider">
            <div className="item__detail-content">
              <summary className="item__title font-weight-bold">10 Boulevard</summary>
              <p className="gray-font-opacity">3.03km . Lebuhraya Sprint, PJU 6A, PJ 47400</p>
            </div>
          </address>
        </div>
        <div className="location-page__list-wrapper">
          <ul className="location-page__list">
            <li className="location-page__item flex flex-middle">
              <i className="location-page__icon-adjust">
                <IconAdjust />
              </i>
              <div className="item border__bottom-divider">
                <summary>Block Camilia</summary>
                <p className="gray-font-opacity">3.03km . Near Block C</p>
              </div>
            </li>
          </ul>
          <div className="text-center">
            <img src={DeliveryErrorImage} alt="" />
            <p className="gray-font-opacity">{t('DeliverToErrorMessage')}</p>
          </div>
        </div>
      </section>
    );
  }
}

Location.propTypes = {};

Location.defaultProps = {};

export default withTranslation()(Location);
