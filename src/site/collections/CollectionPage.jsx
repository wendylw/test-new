import React from 'react';
import { Route, Redirect } from 'react-router-dom';
import { bindActionCreators, compose } from 'redux';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';
import StoreList from '../home/components/StoreList';
import StoreListAutoScroll from '../components/StoreListAutoScroll';
import ModalPageLayout from '../components/ModalPageLayout';
import { collectionsActions, getPageInfo, getStoreList, getShippingType } from '../redux/modules/collections';
import { submitStoreMenu } from '../home/utils';
import { rootActionCreators } from '../redux/modules';
import { getStoreLinkInfo, homeActionCreators } from '../redux/modules/home';
import { appActionCreators, getCurrentPlaceInfo } from '../redux/modules/app';
import '../home/index.scss';
import './CollectionPage.scss';
import withPlaceInfo from '../ordering/containers/Location/withPlaceInfo';
import { checkStateRestoreStatus } from '../redux/modules/index';
import { collectionCardActionCreators, getCurrentCollection } from '../redux/modules/entities/storeCollections';
import constants from '../../utils/constants';
import CleverTap from '../../utils/clevertap';
import ErrorUpdateComponent from '../../components/URLError';
import Utils from '../../../src/utils/utils';
const { COLLECTIONS_TYPE } = constants;

class CollectionPage extends React.Component {
  renderId = `${Date.now()}`;
  scrollTop = 0;
  sectionRef = React.createRef();

  componentDidMount = async () => {
    await this.props.collectionCardActions.getCurrentCollection(this.props.match.params.urlPath);
    if (!this.props.currentCollection) {
      await this.props.collectionCardActions.getCollections(COLLECTIONS_TYPE.ICON);
    }
    const { currentCollection } = this.props;
    if (currentCollection) {
      const { shippingType, urlPath, name, beepCollectionId } = currentCollection;
      if (!checkStateRestoreStatus()) {
        const type = shippingType.length === 1 ? shippingType[0].toLowerCase() : 'delivery';
        this.props.collectionsActions.setShippingType(type);
        this.props.collectionsActions.resetPageInfo(type);
      }
      this.props.collectionsActions.getStoreList(urlPath);
      CleverTap.pushEvent('Collection Page - View Collection Page', {
        'collection name': name,
        'collection id': beepCollectionId,
      });
    }
  };

  backToPreviousPage = () => {
    CleverTap.pushEvent('Collection Page - Click back');

    const { history, location } = this.props;
    const pathname = (location.state && location.state.from) || '/home';

    history.push({
      pathname,
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
    const { urlPath, name, displayType } = this.props.currentCollection || {};
    if (shippingType === 'delivery') {
      CleverTap.pushEvent('Collection Page - Click delivery tab', {
        'collection name': name,
        'collection type': displayType,
      });
    } else {
      CleverTap.pushEvent('Collection Page - Click self pickup tab', {
        'collection name': name,
        'collection type': displayType,
      });
    }

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
            onStoreClicked={(store, index) => {
              CleverTap.pushEvent('Collection Page - Click Store Card', {
                'Collection Name': currentCollection.name,
                'Collection Type': currentCollection.displayType,
                'Store Name': store.name,
                'Store Rank': index + 1,
                'Shipping Type': store.shippingType,
                'has promo': store.promoTag?.length > 0,
                cashback: store.cashbackRate || 0,
              });
              this.backLeftPosition(store);
            }}
            withInfiniteScroll
          />
        </StoreListAutoScroll>
      </div>
    );
  };
  handleErrorScreenBackToHomeButtonClick = () => {
    document.location.href = '/';
  };
  render() {
    const { currentCollection, t } = this.props;
    if (currentCollection) {
      if (currentCollection && Object.keys(currentCollection).length === 0) {
        return null;
      }
    }

    return currentCollection ? (
      <ModalPageLayout title={currentCollection.name} onGoBack={this.backToPreviousPage}>
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
    ) : (
      <ErrorUpdateComponent title={t('CommonErrorMessageUpdate')} description={t('ErrorContent')}>
        <footer className="footer footer__white flex__shrink-fixed padding-top-bottom-small padding-left-right-normal">
          <button
            className="button button__block button__fill padding-normal margin-top-bottom-smaller text-weight-bolder text-uppercase"
            onClick={this.handleErrorScreenBackToHomeButtonClick}
          >
            {t('SatisfyYourCravingsHere')}
          </button>
        </footer>
      </ErrorUpdateComponent>
    );
  }
}
CollectionPage.displayName = 'CollectionPage';

export default compose(
  withPlaceInfo({ fromIp: true }),
  withTranslation('SiteHome'),
  connect(
    state => ({
      currentCollection: getCurrentCollection(state),
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
