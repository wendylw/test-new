import React, { Component } from 'react';
import HybridHeader from '../../../../../components/HybridHeader';
import { withTranslation } from 'react-i18next';
import { IconAddAddress } from '../../../../../components/Icons';
import AddressPicker from '../../../../../components/AddressPicker';
import { bindActionCreators, compose } from 'redux';
import { connect } from 'react-redux';
import {
  actions as appActionCreators,
  getStoreInfoForCleverTap,
  getDeliveryDetails,
} from '../../../../redux/modules/app';
import { loadAddressList } from '../../../../redux/modules/addressList/thunks';
import { getAddressList } from '../../../../redux/modules/addressList/selectors';
import Utils from '../../../../../utils/utils';
import prefetch from '../../../../../common/utils/prefetch-assets';
import { ADDRESS_DISPLAY_MODES } from '../../../../redux/modules/addressList/constants';
import './AddressList.scss';
import CleverTap from '../../../../../utils/clevertap';

class AddressList extends Component {
  componentDidMount = async () => {
    const { loadAddressList } = this.props;

    await loadAddressList();

    prefetch(['ORD_LOC', 'ORD_AD', 'ORD_CI'], ['OrderingCustomer', 'OrderingDelivery']);
  };

  addNewAddress = () => {
    const { history, storeInfoForCleverTap } = this.props;
    CleverTap.pushEvent('Address list - click add new address', storeInfoForCleverTap);
    history.push({
      pathname: '/customer/addressDetail',
      search: window.location.search,
      state: {
        type: 'add',
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

  handleSelectAddress = async (address, index) => {
    const { history, updateDeliveryDetails, deliveryDetails } = this.props;
    const {
      _id: addressId,
      addressName,
      deliveryTo: deliveryToAddress,
      addressDetails,
      comments: deliveryComments,
      location: deliveryToLocation,
      city: deliveryToCity,
      postCode,
      countryCode,
      contactName,
      contactNumber,
    } = address;

    CleverTap.pushEvent('Address list - click existing address', {
      rank: index + 1,
    });

    await updateDeliveryDetails({
      addressId,
      addressName,
      addressDetails,
      deliveryComments,
      deliveryToAddress,
      deliveryToLocation,
      deliveryToCity,
      postCode,
      countryCode,
      phone: contactNumber || deliveryDetails.phone,
      username: contactName || deliveryDetails.username,
    });

    history.push({
      pathname: '/customer',
      search: window.location.search,
    });
  };

  render() {
    const { t, addressList } = this.props;
    return (
      <div>
        <HybridHeader
          headerRef={ref => (this.headerEl = ref)}
          className="flex-middle border__bottom-divider"
          contentClassName="flex-middle"
          isPage={true}
          title={t('DeliverTo')}
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
          <AddressPicker
            displayMode={ADDRESS_DISPLAY_MODES.FULL}
            onSelect={this.handleSelectAddress}
            addressList={addressList}
          />
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
      deliveryDetails: getDeliveryDetails(state),
    }),
    dispatch => ({
      loadAddressList: bindActionCreators(loadAddressList, dispatch),
      updateDeliveryDetails: bindActionCreators(appActionCreators.updateDeliveryDetails, dispatch),
    })
  )
)(AddressList);
