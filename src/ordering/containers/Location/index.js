import React, { Component } from 'react';
import { withTranslation } from 'react-i18next';
import Header from '../../../components/Header';
import { IconPin, IconAdjust } from '../../../components/Icons';
import Constant from '../../../utils/constants';
import DeliveryErrorImage from '../../../images/delivery-error.png';
import { getCurrentAddressInfoByAddress, getCurrentAddressInfo } from './utils';

class Location extends Component {
  state = {
    address: '',
    placeId: '', // placeId of the address user selected,
    hasError: false,
  };

  initializeAddress = async () => {
    const currentAddress = JSON.parse(localStorage.getItem('currentAddress'));
    if (currentAddress) {
      console.log('use address info from localStorage');
      return this.setState({
        address: currentAddress.address,
      });
    }
    await this.tryGeolocation();
  };

  componentDidMount = async () => {
    // will show prompt of permission once entry the page
    await this.initializeAddress();
  };

  handleBackLicked = async () => {
    const { history } = this.props;

    try {
      const currentAddress = await getCurrentAddressInfoByAddress(this.state.address);
      // TODO: has bug here.
      if (currentAddress) {
        localStorage.setItem('currentAddress', JSON.stringify(currentAddress));
      }

      history.goBack();
    } catch (e) {
      console.error(e);
    }
  };

  tryGeolocation = async () => {
    try {
      // getCurrentAddress with fire a permission prompt
      const currentAddress = await getCurrentAddressInfo();
      const { address } = currentAddress;

      // Save into localstorage
      localStorage.setItem('currentAddress', JSON.stringify(currentAddress));

      this.setState({
        address,
        hasError: false,
      });
    } catch (e) {
      console.error(e);
      alert(`error found, address is not identified, use empty`);
      this.setState({ hasError: true });
    }
  };

  render() {
    const { t, history } = this.props;
    const { address } = this.state;

    return (
      <section className="table-ordering__location">
        <Header className="has-right" isPage={true} title={t('DeliverTo')} navFunc={this.handleBackLicked} />
        <div className="location-page__info">
          <div className="location-page__form">
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
          </div>
          {address ? (
            <address
              className="location-page__address item border__bottom-divider"
              onClick={() => {
                history.push({
                  pathname: Constant.ROUTER_PATHS.ORDERING_HOME,
                  search: window.location.search,
                });
              }}
            >
              <div className="item__detail-content">
                <summary className="item__title font-weight-bold">10 Boulevard</summary>
                <p className="gray-font-opacity">{address}</p>
              </div>
            </address>
          ) : null}
        </div>
        <div className="location-page__list-wrapper">
          {/* <ul className="location-page__list">
            <li className="location-page__item flex flex-middle">
              <i className="location-page__icon-adjust">
                <IconAdjust />
              </i>
              <div className="item border__bottom-divider">
                <summary>Block Camilia</summary>
                <p className="gray-font-opacity">3.03km . Near Block C</p>
              </div>
            </li>
          </ul> */}
          {hasError ? (
            <div className="text-center">
              <img src={DeliveryErrorImage} alt="" />
              <p className="gray-font-opacity">{t('DeliverToErrorMessage')}</p>
            </div>
          ) : null}
        </div>
      </section>
    );
  }
}

Location.propTypes = {};

Location.defaultProps = {};

export default withTranslation()(Location);
