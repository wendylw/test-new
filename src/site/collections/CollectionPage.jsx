import React from 'react';
import { bindActionCreators, compose } from 'redux';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';
import { CaretLeft } from 'phosphor-react';
import StoreList from '../components/StoreList';
import StoreListAutoScroll from '../components/StoreListAutoScroll';
import SwitchPanel from '../components/SwitchPanel';
import {
  collectionsActions,
  getPageInfo,
  getStoreList,
  getShippingType,
  getShouldShowSwitchPanel,
} from '../redux/modules/collections';
import { submitStoreMenu } from '../home/utils';
import { rootActionCreators } from '../redux/modules';
import { getStoreLinkInfo, homeActionCreators } from '../redux/modules/home';
import { appActionCreators } from '../redux/modules/app';
import { getAddressInfo, getAddressCoords } from '../../redux/modules/address/selectors';
import { getAddressInfo as fetchAddressInfo } from '../../redux/modules/address/thunks';
import '../home/index.scss';
import './CollectionPage.scss';
import { withAddressInfo } from '../ordering/containers/Location/withAddressInfo';
import { checkStateRestoreStatus } from '../redux/modules/index';
import {
  collectionCardActionCreators,
  getCurrentCollection,
  getCurrentCollectionStatus,
} from '../redux/modules/entities/storeCollections';
import { isSameAddressCoords, scrollTopPosition } from '../utils';
import constants from '../../utils/constants';
import CleverTap from '../../utils/clevertap';
import ErrorComponent from '../../components/Error';
import PageLoader from '../../../src/components/PageLoader';
import styles from './CollectionPage.module.scss';

const { API_REQUEST_STATUS } = constants;

class CollectionPage extends React.Component {
  renderId = `${Date.now()}`;
  scrollTop = 0;
  sectionRef = React.createRef();

  componentDidMount = async () => {
    const { collectionCardActions, fetchAddressInfo } = this.props;
    await collectionCardActions.getCurrentCollection(this.props.match.params.urlPath);

    const hasReduxCache = checkStateRestoreStatus();

    if (hasReduxCache) {
      // Silently fetch address Info without blocking current process
      fetchAddressInfo();
    }

    if (!this.props.currentCollection) {
      return;
    }

    const { currentCollection } = this.props;
    const { urlPath, name, beepCollectionId } = currentCollection;
    if (!hasReduxCache) {
      this.resetCollectionData();
    }
    this.props.collectionsActions.getStoreList(urlPath);
    CleverTap.pushEvent('Collection Page - View Collection Page', {
      'collection name': name,
      'collection id': beepCollectionId,
    });
  };

  componentDidUpdate = async prevProps => {
    const { addressCoords: prevAddressCoords } = prevProps;
    const { addressCoords: currAddressCoords } = this.props;

    if (!isSameAddressCoords(prevAddressCoords, currAddressCoords)) {
      scrollTopPosition(this.sectionRef.current);
      await this.reloadStoreListIfNeeded();
    }
  };

  resetCollectionData = () => {
    const { currentCollection, collectionsActions } = this.props;
    const { shippingType } = currentCollection;
    const type = shippingType.length === 1 ? shippingType[0].toLowerCase() : 'delivery';
    collectionsActions.setShippingType(type);
    collectionsActions.resetPageInfo(type);
  };

  reloadStoreListIfNeeded = async () => {
    const { match, collectionsActions, collectionCardActions } = this.props;

    await collectionCardActions.getCurrentCollection(match.params.urlPath);

    const { currentCollection } = this.props;

    if (!currentCollection) return;

    const { urlPath } = currentCollection;

    collectionsActions.getStoreList(urlPath);
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
    const { shippingType, collectionsActions, addressInfo } = this.props;
    collectionsActions.setPageInfo({ shippingType: shippingType, scrollTop: this.scrollTop });
    this.backupState();
    await submitStoreMenu({
      deliveryAddress: addressInfo,
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

  renderStoreList = () => {
    const { stores, pageInfo, currentCollection } = this.props;
    const { scrollTop } = pageInfo;
    const { urlPath } = currentCollection;

    return (
      <div className="sm:tw-py-4px tw-py-4 tw-bg-white">
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

  renderError() {
    const { t } = this.props;
    return (
      <main className="fixed-wrapper fixed-wrapper__main collection-page__render-error">
        <ErrorComponent title={t('CollectionNotFoundErrorTitle')} description={t('CollectionNotFoundErrorContent')}>
          <footer className="footer footer__white flex__shrink-fixed padding-top-bottom-small padding-left-right-normal">
            <button
              className="button button__block button__fill padding-normal margin-top-bottom-smaller text-weight-bolder text-uppercase"
              onClick={this.handleErrorScreenBackToHomeButtonClick}
            >
              {t('SatisfyYourCravingsHere')}
            </button>
          </footer>
        </ErrorComponent>
      </main>
    );
  }

  render() {
    const { shippingType, currentCollection, currentCollectionStatus, shouldShowSwitchPanel } = this.props;
    if (!currentCollectionStatus || currentCollectionStatus === API_REQUEST_STATUS.PENDING) {
      return <PageLoader />;
    }

    if (!currentCollection) {
      return this.renderError();
    }

    const title = currentCollection.name;

    return (
      <main className="fixed-wrapper fixed-wrapper__main">
        <div className="tw-sticky tw-top-0 tw-z-100 tw-w-full tw-bg-white">
          <header
            className={`${styles.CollectionPageHeaderWrapper} ${
              shouldShowSwitchPanel ? '' : 'tw-border-0 tw-border-b tw-border-solid tw-border-gray-200'
            }`}
          >
            <button
              className={styles.CollectionPageHeaderIconWrapper}
              onClick={this.backToPreviousPage}
              data-heap-name="site.common.back-btn"
            >
              <CaretLeft size={24} weight="light" />
            </button>
            {title ? <h2 className={styles.CollectionPageHeaderTitle}>{title}</h2> : null}
          </header>
          {shouldShowSwitchPanel && (
            <SwitchPanel
              shippingType={shippingType}
              dataHeapName="site.collection.tab-bar"
              handleSwitchTab={this.handleSwitchTab}
            />
          )}
        </div>
        <section
          ref={this.sectionRef}
          className="entry-home fixed-wrapper__container wrapper"
          data-heap-name="site.collection.container"
          data-heap-collection-name={currentCollection.name}
        >
          {this.renderStoreList()}
        </section>
      </main>
    );
  }
}
CollectionPage.displayName = 'CollectionPage';

export default compose(
  withAddressInfo({ fromIp: true }),
  withTranslation('SiteHome'),
  connect(
    state => ({
      currentCollection: getCurrentCollection(state),
      currentCollectionStatus: getCurrentCollectionStatus(state),
      stores: getStoreList(state),
      pageInfo: getPageInfo(state),
      storeLinkInfo: getStoreLinkInfo(state),
      shippingType: getShippingType(state),
      addressInfo: getAddressInfo(state),
      addressCoords: getAddressCoords(state),
      shouldShowSwitchPanel: getShouldShowSwitchPanel(state),
    }),
    dispatch => ({
      fetchAddressInfo: bindActionCreators(fetchAddressInfo, dispatch),
      rootActions: bindActionCreators(rootActionCreators, dispatch),
      appActions: bindActionCreators(appActionCreators, dispatch),
      collectionsActions: bindActionCreators(collectionsActions, dispatch),
      collectionCardActions: bindActionCreators(collectionCardActionCreators, dispatch),
      homeActions: bindActionCreators(homeActionCreators, dispatch),
    })
  )
)(CollectionPage);
