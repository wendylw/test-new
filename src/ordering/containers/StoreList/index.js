import React, { Component } from 'react';
import { withTranslation } from 'react-i18next';
import Constants from '../../../utils/constants';

import { connect } from 'react-redux';
import { bindActionCreators, compose } from 'redux';
import Header from '../../../components/Header';
import img from '../../../images/beep-logo.svg';
import './storeList.scss';
import { actions as homeActionCreators, getStoresList, getStoreHashCode } from '../../redux/modules/home';
import { actions as appActionCreators, getOnlineStoreInfo } from '../../redux/modules/app';
import Utils from '../../../utils/utils';
import { IconChecked } from '../../../components/Icons';
import config from '../../../config';
import qs from 'qs';
const { ADDRESS_RANGE } = Constants;
const StoreListItem = props => (
  <div className="stores-list-item" onClick={() => props.select(props.store)}>
    <p>{props.store.name}</p>
    <p>{Utils.getValidAddress(props.store, ADDRESS_RANGE.COUNTRY)}</p>
    <p>opening Houres:</p>
    <p>{props.storeId === props.store.id && <IconChecked />}</p>
  </div>
);
class StoreList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      storeid: config.storeId,
      search: qs.parse(this.props.history.location.search, { ignoreQueryPrefix: true }),
    };
  }

  async componentDidMount() {
    await this.props.homeActions.loadCoreStores();
    await this.props.appActions.fetchOnlineStoreInfo();
  }

  selectStore = store => {
    this.setState(
      {
        storeid: store.id,
      },
      async () => {
        if (this.state.search.callbackUrl) {
          this.props.history.replace({
            pathname: Constants.ROUTER_PATHS.ORDERING_LOCATION_AND_DATE,
            search: `${this.props.history.location.search}&${store.id ? 'storeid=' + store.id : ''}`,
          });
        } else {
          await this.props.homeActions.getStoreHashData(store.id);
          this.props.history.replace({
            pathname: Constants.ROUTER_PATHS.ORDERING_HOME,
            search: `h=${this.props.storeHash}&type=${this.state.search.type || Constants.DELIVERY_METHOD.DELIVERY}`,
          });
        }
      }
    );
  };

  render() {
    return (
      (this.props.onlineStoreInfo && (
        <div className="stores-list-contain">
          <Header
            className="has-right flex-middle"
            isPage={true}
            title={'Select store'}
            navFunc={() => {
              this.props.history.go(-1);
            }}
          />
          <div className="stores-info">
            <img src={this.props.onlineStoreInfo.logo} alt="" />
            <div className="stores-info-detail">
              <p>{this.props.onlineStoreInfo.storeName}</p>
              <p>{this.props.onlineStoreInfo.businessType}</p>
              <p>Total {this.props.allStore.length} outlets</p>
            </div>
          </div>
          <div className="stores-list">
            {this.props.allStore.map(item => (
              <StoreListItem store={item} storeId={this.state.storeid} select={this.selectStore} key={item.id} />
            ))}
          </div>
        </div>
      )) ||
      null
    );
  }
}

export default compose(
  withTranslation(),
  connect(
    state => ({
      allStore: getStoresList(state),
      onlineStoreInfo: getOnlineStoreInfo(state),
      storeHash: getStoreHashCode(state),
    }),
    dispatch => ({
      homeActions: bindActionCreators(homeActionCreators, dispatch),
      appActions: bindActionCreators(appActionCreators, dispatch),
    })
  )
)(StoreList);
