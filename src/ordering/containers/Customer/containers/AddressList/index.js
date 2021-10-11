import React, { Component } from 'react';
import HybridHeader from '../../../../../components/HybridHeader';
import { withTranslation } from 'react-i18next';
import { IconAddAddress, IconBookmark, IconNext } from '../../../../../components/Icons';
import Tag from '../../../../../components/Tag';
import { bindActionCreators, compose } from 'redux';
import { connect } from 'react-redux';
import { actions as appActionCreators, getStoreInfoForCleverTap } from '../../../../redux/modules/app';
import { loadAddressList } from '../../redux/common/thunks';
import { getAddressList } from '../../redux/common/selectors';
import Utils from '../../../../../utils/utils';
import './AddressList.scss';
import CleverTap from '../../../../../utils/clevertap';

class AddressList extends Component {
  componentDidMount() {
    const { loadAddressList } = this.props;

    loadAddressList();
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
    const { t, addressList, history, updateDeliveryDetails } = this.props;
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
        postCode,
      } = address;
      return (
        <div
          className={`flex flex-space-between margin-left-right-normal border__bottom-divider ${
            availableStatus ? 'active' : 'address-list__disabled'
          }`}
          key={index}
          onClick={
            availableStatus
              ? async () => {
                  CleverTap.pushEvent('Address list - click existing address', {
                    rank: index + 1,
                  });
                  await updateDeliveryDetails({
                    addressId,
                    addressName,
                    addressDetails,
                    deliveryComments: comments,
                    deliveryToAddress: deliveryTo,
                    deliveryToLocation: location,
                    deliveryToCity,
                    postCode,
                  });
                  if (Utils.hasNativeSavedAddress()) {
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
        <HybridHeader
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
      addressList: getAddressList(state),
      storeInfoForCleverTap: getStoreInfoForCleverTap(state),
    }),
    dispatch => ({
      loadAddressList: bindActionCreators(loadAddressList, dispatch),
      updateDeliveryDetails: bindActionCreators(appActionCreators.updateDeliveryDetails, dispatch),
    })
  )
)(AddressList);
