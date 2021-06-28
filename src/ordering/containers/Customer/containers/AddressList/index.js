import React, { Component } from 'react';
import Header from '../../../../../components/Header';
import { withTranslation } from 'react-i18next';
import { IconAddAddress, IconBookmark, IconNext } from '../../../../../components/Icons';
import Tag from '../../../../../components/Tag';
import { bindActionCreators, compose } from 'redux';
import { connect } from 'react-redux';
import { getRequestInfo, getUser, getStoreInfoForCleverTap } from '../../../../redux/modules/app';
import {
  actions as customerActionCreators,
  getDeliveryDetails,
  getDeliveryAddressList,
} from '../../../../redux/modules/customer';
import Utils from '../../../../../utils/utils';
import './AddressList.scss';
import webviewUtils from '../../../../../utils/webview-utils';
import CleverTap from '../../../../../utils/clevertap';

class AddressList extends Component {
  componentDidMount() {
    const { user, requestInfo, customerActions } = this.props;
    const { consumerId } = user || {};
    const { storeId } = requestInfo || {};

    // todo: 怎么避免拿 addreesList 时候避免更新deliveryToAddress
    // use 'fixed' to get pure addressList with updating deliveryToAddress
    customerActions.fetchConsumerAddressList({ consumerId, storeId, preventUpdate: true });
  }

  addNewAddress = () => {
    const { history, storeInfoForCleverTap } = this.props;
    CleverTap.pushEvent('Address list - click add new address', storeInfoForCleverTap);
    history.push({
      pathname: '/customer/addressDetail',
      search: window.location.search,
      state: {
        fromAddressList: true,
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
    const { t, addressList, history, customerActions } = this.props;
    return (addressList || []).map((address, index) => {
      const {
        _id: addressId,
        addressName,
        deliveryTo,
        addressDetails,
        comments,
        availableStatus,
        location,
        city: deliveryToCity,
      } = address;
      return (
        <div
          className={`flex flex-space-between margin-left-right-normal border__bottom-divider ${
            availableStatus ? 'active' : 'address-list__disabled'
          }`}
          key={index}
          onClick={
            availableStatus
              ? () => {
                  CleverTap.pushEvent('Address list - click existing address', {
                    rank: index + 1,
                  });
                  customerActions.patchDeliveryDetails({
                    addressId,
                    addressName,
                    addressDetails,
                    deliveryComments: comments,
                    deliveryToAddress: deliveryTo,
                    deliveryToLocation: location,
                    deliveryToCity,
                  });
                  if (webviewUtils.hasNativeSavedAddress()) {
                    const deliveryAddress = JSON.parse(sessionStorage.getItem('deliveryAddress'));
                    sessionStorage.setItem(
                      'deliveryAddress',
                      JSON.stringify({ ...deliveryAddress, addressName: addressName })
                    );
                  }
                  history.push({
                    pathname: '/customer',
                    search: window.location.search,
                  });
                }
              : null
          }
        >
          <div className="margin-top-bottom-normal">
            <IconBookmark className={`icon address-list__book-mark ${availableStatus ? '' : 'icon__default'}`} />
          </div>
          <div className="address-list__delivery-info margin-normal">
            <div>
              <div>
                <span>{addressName}</span>
                {!availableStatus && (
                  <Tag text={t('OutOfRange')} className="tag__primary tag__small margin-left-right-normal" />
                )}
              </div>
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
          headerRef={ref => (this.headerEl = ref)}
          className="flex-middle border__bottom-divider"
          contentClassName="flex-middle"
          isPage={true}
          title={t('DeliveryTo')}
          navFunc={() => {
            CleverTap.pushEvent('Address list - click back arrow');
            this.handleClickBack();
          }}
        />
        <section
          className="address-list__container"
          style={{
            top: `${Utils.mainTop({
              headerEls: [this.headerEl],
            })}px`,
            height: `${Utils.windowSize().height -
              Utils.mainTop({
                headerEls: [this.deliveryEntryEl, this.headerEl, this.deliveryFeeEl],
              })}px`,
          }}
        >
          <div
            className="flex flex-middle padding-normal"
            onClick={() => {
              this.addNewAddress();
            }}
          >
            <IconAddAddress className="address-list__add-icon icon border-radius-base" />
            <span className="text-size-big text-weight-bolder padding-left-right-normal">{t('AddNewAddress')}</span>
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
AddressList.displayName = 'AddressList';

export default compose(
  withTranslation(),
  connect(
    state => ({
      user: getUser(state),
      deliveryDetails: getDeliveryDetails(state),
      addressList: getDeliveryAddressList(state),
      requestInfo: getRequestInfo(state),
      storeInfoForCleverTap: getStoreInfoForCleverTap(state),
    }),
    dispatch => ({
      customerActions: bindActionCreators(customerActionCreators, dispatch),
    })
  )
)(AddressList);
