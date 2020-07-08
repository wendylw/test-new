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
import { collectionCardActionCreators } from '../redux/modules/entities/storeCollections';

class CollectionPage extends React.Component {
  renderId = `${Date.now()}`;
  scrollTop = 0;
  sectionRef = React.createRef();

  componentDidMount = async () => {
    if (!this.props.currentCollection) {
      await this.props.collectionCardActions.getCollections();
    }
    const { currentCollection } = this.props;
    const { shippingType, urlPath } = currentCollection;
    if (!checkStateRestoreStatus()) {
      const type = shippingType.length === 1 ? shippingType[0].toLowerCase() : 'delivery';
      this.props.collectionsActions.setShippingType(type);
      this.props.collectionsActions.resetPageInfo(type);
    }
    this.props.collectionsActions.getStoreList(urlPath);
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
    const { urlPath } = this.props.currentCollection || {};
    this.props.collectionsActions.setShippingType(shippingType);
    this.props.collectionsActions.resetPageInfo(shippingType);
    this.props.collectionsActions.getStoreList(urlPath);
  };

  renderSwitchBar = () => {
    const { t, shippingType } = this.props;
    const classList = 'switch-bar text-center text-weight-bolder padding-top-bottom-normal';
    return (
      <ul className="header flex flex-space-around text-uppercase border__bottom-divider sticky-wrapper">
        <li
          className={`${classList} ${shippingType === 'delivery' ? 'switch-bar__active' : 'text-opacity'}`}
          data-testid="switchBar"
          data-heap-name="site.collection.tab-bar"
          data-heap-delivery-type="delivery"
          onClick={() => this.handleSwitchTab('delivery')}
        >
          {t('Delivery')}
        </li>
        <li
          className={`${classList} ${shippingType === 'pickup' ? 'switch-bar__active' : 'text-opacity'}`}
          data-heap-name="site.collection.tab-bar"
          data-heap-delivery-type="pickup"
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
    const { urlPath } = currentCollection;

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
            loadMoreStores={() => {
              this.props.collectionsActions.getStoreList(urlPath);
            }}
            onStoreClicked={store => this.backLeftPosition(store)}
            withInfiniteScroll
          />
        </StoreListAutoScroll>
      </div>
    );
  };

  render() {
    const { currentCollection } = this.props;
    if (!currentCollection) {
      return null;
    }
    return (
      <ModalPageLayout title={currentCollection.name} onGoBack={this.handleBackClicked}>
        {currentCollection.shippingType.length !== 2 ? null : this.renderSwitchBar()}
        <section
          ref={this.sectionRef}
          className="entry-home fixed-wrapper__container wrapper"
          data-heap-name="site.collection.container"
          data-heap-collection-name={currentCollection.name}
        >
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
      collectionCardActions: bindActionCreators(collectionCardActionCreators, dispatch),
      homeActions: bindActionCreators(homeActionCreators, dispatch),
    })
  )
)(CollectionPage);
