import React from 'react';
import { bindActionCreators, compose } from 'redux';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';
import { CaretLeft, X } from 'phosphor-react';
import _get from 'lodash/get';
import StoreList from '../components/StoreList';
import StoreListAutoScroll from '../components/StoreListAutoScroll';
import { collectionsActions, getPageInfo, getStoreList, getShippingType } from '../redux/modules/collections';
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
import { actions as filterActionCreators } from '../redux/modules/filter';
import {
  getCategoryFilterList,
  getHasAnyCategorySelected,
  getFilterOptionSearchParams,
} from '../redux/modules/filter/selectors';
import { loadSearchOptionList, backUpSearchOptionList, resetSearchOptionList } from '../redux/modules/filter/thunks';
import { TYPES, IDS, FILTER_DRAWER_SUPPORT_TYPES, FILTER_BACKUP_STORAGE_KEYS } from '../redux/modules/filter/constants';
import { isSameAddressCoords, scrollTopPosition } from '../utils';
import constants from '../../utils/constants';
import CleverTap from '../../utils/clevertap';
import FilterBar from '../components/FilterBar';
import Drawer from '../../common/components/Drawer';
import Button from '../../common/components/Button';
import OptionSelector from '../components/OptionSelector';
import ErrorComponent from '../../components/Error';
import PageLoader from '../../../src/components/PageLoader';
import styles from './CollectionPage.module.scss';

const { API_REQUEST_STATUS } = constants;

class CollectionPage extends React.Component {
  renderId = `${Date.now()}`;
  scrollTop = 0;
  sectionRef = React.createRef();

  state = {
    drawerInfo: { category: null },
  };

  componentDidMount = async () => {
    const { collectionCardActions, fetchAddressInfo, loadSearchOptionList } = this.props;
    await collectionCardActions.getCurrentCollection(this.props.match.params.urlPath);

    const hasReduxCache = checkStateRestoreStatus();

    if (hasReduxCache) {
      // Silently fetch address Info without blocking current process
      fetchAddressInfo();
    } else {
      // Try to load option list from cache first then fetch from server
      await loadSearchOptionList({ key: FILTER_BACKUP_STORAGE_KEYS.COLLECTION });
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
    const { addressCoords: prevAddressCoords, filterOptionParams: prevFilterOptionParams } = prevProps;
    const { addressCoords: currAddressCoords, filterOptionParams: currFilterOptionParams } = this.props;

    const hasFilterOptionParamsChanged = prevFilterOptionParams !== currFilterOptionParams;

    if (!isSameAddressCoords(prevAddressCoords, currAddressCoords)) {
      scrollTopPosition(this.sectionRef.current);
      await this.reloadStoreListIfNeeded();
    }

    if (hasFilterOptionParamsChanged) {
      this.props.backUpSearchOptionList({ key: FILTER_BACKUP_STORAGE_KEYS.COLLECTION });
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

    const { history, location, resetSearchOptionList } = this.props;
    const pathname = (location.state && location.state.from) || '/home';

    history.push({
      pathname,
    });

    resetSearchOptionList({ key: FILTER_BACKUP_STORAGE_KEYS.COLLECTION });
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
                'has lowest price': _get(store, 'isLowestPrice', false),
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

  handleClickCategoryButton = category => {
    const { id, type } = category;

    if (id === IDS.SORT_BY) {
      CleverTap.pushEvent('Collection Page - Click sort by button');
    } else {
      CleverTap.pushEvent('Collection Page - Click quick filter button');
    }

    if (FILTER_DRAWER_SUPPORT_TYPES.includes(type)) {
      this.setState({ drawerInfo: { category } });
    } else {
      this.props.filterActions.updateCategorySelectStatus({ id });
    }
  };

  handleClickResetAllCategoryButton = () => {
    this.props.resetSearchOptionList({ key: FILTER_BACKUP_STORAGE_KEYS.COLLECTION });
    CleverTap.pushEvent('Collection Page - Click reset quick sort and filter button');
  };

  handleCloseDrawer = () => {
    this.setState({ drawerInfo: { category: null } });
  };

  handleClickSingleChoiceOptionItem = (category, option) => {
    const { id: categoryId } = category;
    const { name: optionName } = option;

    if (categoryId === IDS.SORT_BY) {
      CleverTap.pushEvent('Collection Page - Select sort options (Sort button)', {
        'type of sort': optionName,
      });
    }

    this.props.filterActions.updateCategoryOptionSelectStatus({ categoryId, option });
    this.handleCloseDrawer();
  };

  handleClickResetOptionButton = category => {
    const { id: categoryId, name: filterName } = category;

    CleverTap.pushEvent('Collection Page - Reset (Filter slide-up)', {
      'type of filter': filterName,
    });

    this.props.filterActions.resetCategoryAllOptionSelectStatus({ categoryId });
    this.handleCloseDrawer();
  };

  handleClickApplyAllOptionButton = (category, options) => {
    const { id: categoryId, name: filterName } = category;
    const optionNames = options
      .filter(option => option.selected)
      .map(option => option.name)
      .join(', ');

    CleverTap.pushEvent('Collection Page - Select filter options (Filter button)', {
      'type of filter': filterName,
      'filter options': optionNames,
    });

    this.props.filterActions.updateCategoryAllOptionSelectStatus({ categoryId, options });
    this.handleCloseDrawer();
  };

  renderDrawer = () => {
    const {
      drawerInfo: { category },
    } = this.state;
    const shouldShowDrawer = !!category;
    const title = _get(category, 'name', '');

    return (
      <Drawer
        className={styles.CollectionPageCategoryDrawerHeaderWrapper}
        show={shouldShowDrawer}
        onClose={this.handleCloseDrawer}
        style={{ maxHeight: '99.8%' }}
      >
        <div className="tw-flex tw-flex-col tw-max-h-screen tw-overflow-hidden">
          <div className={styles.CollectionPageCategoryDrawerHeaderContainer}>
            <Button
              type="text"
              onClick={this.handleCloseDrawer}
              className={`${styles.CollectionPageCategoryDrawerHeaderButton} beep-text-reset`}
            >
              <X weight="light" className="tw-flex-shrink-0 tw-text-gray" size={24} />
            </Button>
            <h2 className="tw-flex-1 tw-text-lg tw-leading-relaxed tw-text-center tw-px-16 sm:tw-px-16px tw-font-bold tw-capitalize">
              {title}
            </h2>
          </div>
          {shouldShowDrawer && (
            <OptionSelector
              category={category}
              onSingleChoiceClick={this.handleClickSingleChoiceOptionItem}
              onResetButtonClick={this.handleClickResetOptionButton}
              onApplyButtonClick={this.handleClickApplyAllOptionButton}
              shouldUseRadioGroup={category.type === TYPES.SINGLE_SELECT}
              shouldUseCheckbox={category.type === TYPES.MULTI_SELECT}
            />
          )}
        </div>
      </Drawer>
    );
  };

  render() {
    const { currentCollection, currentCollectionStatus, categoryFilterList, shouldShowResetButton } = this.props;
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
          <header className={styles.CollectionPageHeaderWrapper}>
            <button
              className={styles.CollectionPageHeaderIconWrapper}
              onClick={this.backToPreviousPage}
              data-heap-name="site.common.back-btn"
            >
              <CaretLeft size={24} weight="light" />
            </button>
            {title ? <h2 className={styles.CollectionPageHeaderTitle}>{title}</h2> : null}
          </header>
          <FilterBar
            className={styles.CollectionPageFilterBarWrapper}
            categories={categoryFilterList}
            shouldShowResetButton={shouldShowResetButton}
            onResetButtonClick={this.handleClickResetAllCategoryButton}
            onCategoryButtonClick={this.handleClickCategoryButton}
          />
        </div>
        <section
          ref={this.sectionRef}
          className="entry-home fixed-wrapper__container wrapper"
          data-heap-name="site.collection.container"
          data-heap-collection-name={currentCollection.name}
        >
          {this.renderStoreList()}
        </section>
        {this.renderDrawer()}
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
      categoryFilterList: getCategoryFilterList(state),
      shouldShowResetButton: getHasAnyCategorySelected(state),
      filterOptionParams: getFilterOptionSearchParams(state),
    }),
    dispatch => ({
      fetchAddressInfo: bindActionCreators(fetchAddressInfo, dispatch),
      loadSearchOptionList: bindActionCreators(loadSearchOptionList, dispatch),
      backUpSearchOptionList: bindActionCreators(backUpSearchOptionList, dispatch),
      resetSearchOptionList: bindActionCreators(resetSearchOptionList, dispatch),
      rootActions: bindActionCreators(rootActionCreators, dispatch),
      appActions: bindActionCreators(appActionCreators, dispatch),
      collectionsActions: bindActionCreators(collectionsActions, dispatch),
      collectionCardActions: bindActionCreators(collectionCardActionCreators, dispatch),
      homeActions: bindActionCreators(homeActionCreators, dispatch),
      filterActions: bindActionCreators(filterActionCreators, dispatch),
    })
  )
)(CollectionPage);
