import React from 'react';
import { bindActionCreators, compose } from 'redux';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';
import StoreList from '../home/components/StoreList';
import StoreListAutoScroll from '../components/StoreListAutoScroll';
import ModalPageLayout from '../components/ModalPageLayout';
import {
  collectionsActions,
  getCurrentCollection,
  getPageInfo,
  getStoreList,
  getShippingType,
} from '../redux/modules/collections';
import { submitStoreMenu } from '../home/utils';
import { rootActionCreators } from '../redux/modules';
import { getStoreLinkInfo, homeActionCreators } from '../redux/modules/home';
import { appActionCreators, getCurrentPlaceInfo } from '../redux/modules/app';
import '../home/index.scss';
import './CollectionPage.scss';
import withPlaceInfo from '../ordering/containers/Location/withPlaceInfo';
import { checkStateRestoreStatus } from '../redux/modules/index';

class CollectionPage extends React.Component {
  renderId = `${Date.now()}`;
  scrollTop = 0;
  sectionRef = React.createRef();

  componentDidMount = async () => {
    const { currentCollection } = this.props;

    if (!checkStateRestoreStatus()) {
      const shippingType = currentCollection.slug === 'self-pickup' ? 'pickup' : 'delivery';
      this.props.collectionsActions.setShippingType(shippingType);
      this.props.collectionsActions.resetPageInfo(shippingType);
    }
    this.props.collectionsActions.getStoreList(currentCollection.tags);
  };

  handleBackClicked = () => {
    this.goBackHome();
  };

  goBackHome = () => {
    this.props.history.push({
      pathname: '/home',
    });
  };

  backupState = () => {
    this.props.rootActions.backup();
  };

  backLeftPosition = async store => {
    const { shippingType, collectionsActions, currentPlaceInfo } = this.props;
    collectionsActions.setPageInfo({ shippingType: shippingType, scrollTop: this.scrollTop });
    this.backupState();
    await submitStoreMenu({
      deliveryAddress: currentPlaceInfo,
      store: store,
      source: document.location.href,
      shippingType,
    });
  };

  handleSwitchTab = shippingType => {
    const { tags } = this.props.currentCollection || {};
    this.props.collectionsActions.setShippingType(shippingType);
    this.props.collectionsActions.resetPageInfo(shippingType);
    this.props.collectionsActions.getStoreList(tags);
  };

  renderSwitchBar = () => {
    const { t, shippingType } = this.props;
    const classList = 'switch-bar text-center text-weight-bolder padding-top-bottom-normal';
    return (
      <ul className="header flex flex-space-around text-uppercase border__bottom-divider sticky-wrapper">
        <li
          className={`${classList} ${shippingType === 'delivery' ? 'switch-bar__active' : 'text-opacity'}`}
          data-testid="switchBar"
          onClick={() => this.handleSwitchTab('delivery')}
        >
          {t('Delivery')}
        </li>
        <li
          className={`${classList} ${shippingType === 'pickup' ? 'switch-bar__active' : 'text-opacity'}`}
          onClick={() => this.handleSwitchTab('pickup')}
        >
          {t('SelfPickup')}
        </li>
      </ul>
    );
  };

  renderStoreList = () => {
    const { stores, pageInfo, currentCollection } = this.props;
    const { scrollTop } = pageInfo;
    const { tags } = currentCollection;

    return (
      <div className="store-card-list__container padding-normal">
        <StoreListAutoScroll
          getScrollParent={() => this.sectionRef.current}
          defaultScrollTop={scrollTop}
          onScroll={scrollTop => (this.scrollTop = scrollTop)}
        >
          <StoreList
            key={`store-list-${this.renderId}`}
            stores={stores}
            hasMore={pageInfo.hasMore}
            getScrollParent={() => this.sectionRef.current}
            loadMoreStores={page => {
              console.log('page =', page);
              this.props.collectionsActions.getStoreList(tags);
            }}
            onStoreClicked={store => this.backLeftPosition(store)}
            withInfiniteScroll
          />
        </StoreListAutoScroll>
      </div>
    );
  };

  render() {
    const { t, currentCollection } = this.props;
    if (!currentCollection) {
      return null;
    }
    return (
      <ModalPageLayout title={t(currentCollection.label)} onGoBack={this.handleBackClicked}>
        {currentCollection.slug === 'self-pickup' ? null : this.renderSwitchBar()}
        <section ref={this.sectionRef} className="entry-home fixed-wrapper__container wrapper">
          {this.renderStoreList()}
        </section>
      </ModalPageLayout>
    );
  }
}

export default compose(
  withPlaceInfo(),
  withTranslation('SiteHome'),
  connect(
    (state, ownProps) => ({
      currentCollection: getCurrentCollection(state, ownProps),
      stores: getStoreList(state),
      pageInfo: getPageInfo(state),
      storeLinkInfo: getStoreLinkInfo(state),
      shippingType: getShippingType(state),
      currentPlaceInfo: getCurrentPlaceInfo(state),
    }),
    dispatch => ({
      rootActions: bindActionCreators(rootActionCreators, dispatch),
      appActions: bindActionCreators(appActionCreators, dispatch),
      collectionsActions: bindActionCreators(collectionsActions, dispatch),
      homeActions: bindActionCreators(homeActionCreators, dispatch),
    })
  )
)(CollectionPage);
