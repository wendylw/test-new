import React, { Component } from 'react';
import { withTranslation } from 'react-i18next';
import Constants from '../../../utils/constants';

import { connect } from 'react-redux';
import { bindActionCreators, compose } from 'redux';
import Header from '../../../components/Header';
import img from '../../../images/beep-logo.svg';
import './storeList.scss';
import { actions as homeActionCreators, getStoresList } from '../../redux/modules/home';
import Utils from '../../../utils/utils';
const { ADDRESS_RANGE } = Constants;
const StoreListItem = props => (
  <div className="stores-list-item">
    <p>{props.store.name}</p>
    <p>{Utils.getValidAddress(props.store, ADDRESS_RANGE.COUNTRY)}</p>
    <p>cccccccc</p>
    <i></i>
  </div>
);
class StoreList extends Component {
  async componentDidMount() {
    await this.props.homeActions.loadCoreStores();
    console.log(this.props);
  }

  render() {
    return (
      <div className="stores-list-contain">
        <Header className="has-right flex-middle" isPage={true} title={'Select store'} navFunc={() => {}} />
        <div className="stores-info">
          <img src={img} alt="" />
          <div className="stores-info-detail">
            <p>Ice Dreams Cafe</p>
            <p>caffee,cake,</p>
            <p>Total 3 outlets</p>
          </div>
        </div>
        <div className="stores-list">
          {this.props.allStore.map(item => (
            <StoreListItem store={item} />
          ))}
        </div>
      </div>
    );
  }
}

export default compose(
  withTranslation(),
  connect(
    state => ({
      allStore: getStoresList(state),
    }),
    dispatch => ({
      homeActions: bindActionCreators(homeActionCreators, dispatch),
    })
  )
)(StoreList);
