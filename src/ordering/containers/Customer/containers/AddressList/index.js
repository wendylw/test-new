import React, { Component } from 'react';
import Header from '../../../../../components/Header';
import addAddress from '../../../../../images/add-address.svg';
import { withTranslation } from 'react-i18next';
import './AddressList.scss';
import { IconBookmark, IconNext } from '../../../../../components/Icons';
import Tag from '../../../../../components/Tag';
import Constants from '../../../../../utils/constants';

class AddressList extends Component {
  state = {
    addressList: [
      {
        addressName: 'test',
        deliveryTo: 'KLCC, Kuala Lumpur City Centre, 吉隆坡马来西亚',
        addressDetails: 'floor 1',
        comments: 'pass the pizza',
        // availableStatus: true,
      },
    ],
  };

  addNewAddress = () => {
    const { history } = this.props;
    history.push({
      pathname: Constants.ROUTER_PATHS.ADDRESS_DETAIL,
      search: window.location.search,
      state: {
        from: '/addressList',
        action: 'add',
      },
    });
  };

  handleClickBack = () => {
    const { history } = this.props;
    history.push({
      pathname: '/customer',
      search: window.location.search,
    });
  };

  renderAddressCard = () => {
    const { t } = this.props;
    const { addressList } = this.state;
    return (addressList || []).map(address => {
      const { addressName, deliveryTo, addressDetails, comments, availableStatus } = address;
      return (
        <div
          className={`flex flex-space-between margin-left-right-normal border__bottom-divider ${
            availableStatus ? 'active' : 'address-list__disabled'
          }`}
        >
          <div className="margin-top-bottom-normal">
            <IconBookmark className={`icon padding-top-bottom-small ${availableStatus ? '' : 'icon__default'}`} />
          </div>
          <div className="margin-normal">
            <div>
              <summary>
                <span>{addressName}</span>
                {!availableStatus && (
                  <Tag text={t('OutOfRange')} className="tag__primary tag__small margin-left-right-normal" />
                )}
              </summary>
              <p className="padding-top-bottom-small text-opacity">{deliveryTo}</p>
            </div>
            <div className="padding-top-bottom-small text-line-height-base">
              <div>{addressDetails}</div>
              <div>{comments}</div>
            </div>
          </div>
          <div className="flex flex-middle">
            <IconNext className={`icon ${availableStatus ? '' : 'icon__default'} icon__small `} />
          </div>
        </div>
      );
    });
  };

  render() {
    const { t } = this.props;
    return (
      <div>
        <Header
          className="flex-middle border__bottom-divider"
          contentClassName="flex-middle"
          isPage={true}
          title={t('DeliveryTo')}
          navFunc={this.handleClickBack.bind(this)}
        />
        <section>
          <div className="flex flex-middle padding-normal">
            <img src={addAddress} className="address-list__add-icon icon border-radius-base" />
            <span
              className="text-size-big text-weight-bolder padding-left-right-normal"
              onClick={() => {
                this.addNewAddress();
              }}
            >
              {t('AddNewAddress')}
            </span>
          </div>
          <div>
            <p className="address-list__save-title padding-normal text-weight-bolder">{t('SavedAddress')}</p>
            {this.renderAddressCard()}
          </div>
        </section>
      </div>
    );
  }
}

export default withTranslation()(AddressList);
