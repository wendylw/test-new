import React from 'react';
import { bindActionCreators, compose } from 'redux';
import { connect } from 'react-redux';
import { withTranslation, Trans } from 'react-i18next';
import { CaretLeft, X } from 'phosphor-react';
import _get from 'lodash/get';
import StoreList from '../components/StoreList';
import StoreListAutoScroll from '../components/StoreListAutoScroll';
import {
  getPageInfo,
  getStoreList,
  getShippingType,
  getShouldShowPageLoader,
  getShouldShowStoreListLoader,
  getShouldShowNoFilteredResultPage,
} from '../redux/modules/collections/selectors';
import {
  setPageInfo as setPageInfoThunkCreator,
  resetPageInfo as resetPageInfoThunkCreator,
  setShippingType as setShippingTypeThunkCreator,
  resetShippingType as resetShippingTypeThunkCreator,
  loadStoreList as loadStoreListThunkCreator,
  resetStoreList as resetStoreListThunkCreator,
} from '../redux/modules/collections/thunks';
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
import {
  getCategoryFilterList,
  getHasAnyCategorySelected,
  getFilterOptionSearchParams,
} from '../redux/modules/filter/selectors';
import {
  loadSearchOptionList as loadSearchOptionListThunkCreator,
  backUpSelectedOptionList as backUpSelectedOptionListThunkCreator,
  resetSelectedOptionList as resetSelectedOptionListThunkCreator,
  toggleCategorySelectStatus as toggleCategorySelectStatusThunkCreator,
  updateCategoryOptionSelectStatus as updateCategoryOptionSelectStatusThunkCreator,
  resetCategoryAllOptionSelectStatus as resetCategoryAllOptionSelectStatusThunkCreator,
} from '../redux/modules/filter/thunks';
import { TYPES, IDS, FILTER_DRAWER_SUPPORT_TYPES, FILTER_BACKUP_STORAGE_KEYS } from '../redux/modules/filter/constants';
import { SHIPPING_TYPES } from '../../common/utils/constants';
import { isSameAddressCoords, scrollTopPosition } from '../utils';
import CleverTap from '../../utils/clevertap';
import FilterBar from '../components/FilterBar';
import Drawer from '../../common/components/Drawer';
import DrawerHeader from '../../common/components/Drawer/DrawerHeader';
import Button from '../../common/components/Button';
import SingleChoiceSelector from '../components/OptionSelectors/SingleChoiceSelector';
import MultipleChoiceSelector from '../components/OptionSelectors/MultipleChoiceSelector';
import ErrorComponent from '../../components/Error';
import PageLoader from '../../../src/components/PageLoader';
import BeepNotResultImage from '../../images/beep-no-results.svg';
import styles from './CollectionPage.module.scss';

class CollectionPage extends React.Component {
  renderId = `${Date.now()}`;
  scrollTop = 0;
  sectionRef = React.createRef();

  state = {
    drawerInfo: { category: null },
    filterBarSwiperRef: null,
  };

  componentDidMount = async () => {
    const { collectionCardActions, fetchAddressInfo, loadSearchOptionList, loadStoreList } = this.props;
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
      await this.resetCollectionData();
    }

    loadStoreList(urlPath);

    CleverTap.pushEvent('Collection Page - View Collection Page', {
      'collection name': name,
      'collection id': beepCollectionId,
    });
  };

  componentDidUpdate = async prevProps => {
    const {
      addressCoords: prevAddressCoords,
      filterOptionParams: prevFilterOptionParams,
      shippingType: prevShippingType,
    } = prevProps;
    const {
      addressCoords: currAddressCoords,
      filterOptionParams: currFilterOptionParams,
      shippingType: currShippingType,
    } = this.props;

    const hasAddressCoordsChanged = !isSameAddressCoords(prevAddressCoords, currAddressCoords);
    const hasFilterOptionParamsChanged = prevFilterOptionParams !== currFilterOptionParams;
    // Exclude shipping type is null for avoiding store list reloading sake.
    const hasShippingTypeChanged = !!prevShippingType && prevShippingType !== currShippingType;
    const shouldReloadStoreList = hasAddressCoordsChanged || hasFilterOptionParamsChanged || hasShippingTypeChanged;

    if (shouldReloadStoreList) {
      if (hasAddressCoordsChanged) {
        const { match, collectionCardActions } = this.props;
        await collectionCardActions.getCurrentCollection(match.params.urlPath);
      }

      const { currentCollection, resetPageInfo, loadStoreList } = this.props;

      if (currentCollection) {
        const { urlPath } = currentCollection;
        scrollTopPosition(this.sectionRef.current);
        await resetPageInfo();
        loadStoreList(urlPath);
      }
    }

    // Pickup filter is not included in the filter option params so we need to check shipping type separately
    if (hasFilterOptionParamsChanged || hasShippingTypeChanged) {
      const { filterBarSwiperRef } = this.state;
      // NOTE: Once the sort & filter selected options are changed, the swiper should be re-rendered. Otherwise, the offsets of slides will be wrong.
      // API Doc: https://swiperjs.com/swiper-api#method-swiper-update
      filterBarSwiperRef?.update();
      this.props.backUpSelectedOptionList({ key: FILTER_BACKUP_STORAGE_KEYS.COLLECTION });
    }
  };

  componentWillUnmount = () => {
    // Reset filter redux data state when user leaves the page in below 2 cases:
    // 1. User directly clicks the back button from browser
    // 2. User directly clicks the back button from the collection page

    this.props.resetSelectedOptionList({ key: FILTER_BACKUP_STORAGE_KEYS.COLLECTION });
  };

  resetCollectionData = async () => {
    const { categoryFilterList, currentCollection, resetPageInfo, setShippingType } = this.props;
    const pickupFilter = categoryFilterList.find(filter => filter.id === IDS.PICK_UP);
    const { shippingType } = currentCollection;

    // Forward compatibility:
    // If pickup filter has been selected, we will set shipping type to pickup
    // Backward compatibility:
    // If no shipping type is set and only one shipping type is available then we will use the existing one.
    // Otherwise, we will set shipping type to delivery
    const type = pickupFilter?.selected
      ? SHIPPING_TYPES.PICKUP
      : shippingType.length === 1
      ? shippingType[0].toLowerCase()
      : SHIPPING_TYPES.DELIVERY;

    await setShippingType({ shippingType: type });
    await resetPageInfo();
  };

  backToPreviousPage = () => {
    CleverTap.pushEvent('Collection Page - Click back');

    const { history, location, resetPageInfo, resetShippingType, resetStoreList } = this.props;
    const pathname = (location.state && location.state.from) || '/home';

    history.push({
      pathname,
    });

    // Reset collection data state
    resetShippingType();
    resetStoreList();
    resetPageInfo();
  };

  backupState = () => {
    this.props.rootActions.backup();
  };

  backLeftPosition = async store => {
    const { shippingType, addressInfo, setPageInfo } = this.props;
    setPageInfo({ scrollTop: this.scrollTop });
    this.backupState();
    await submitStoreMenu({
      deliveryAddress: addressInfo,
      store: store,
      source: document.location.href,
      shippingType,
    });
  };

  renderStoreList = () => {
    const {
      t,
      stores,
      pageInfo,
      loadStoreList,
      currentCollection,
      shouldShowStoreListLoader,
      shouldShowNoFilteredResultPage,
    } = this.props;
    const { scrollTop } = pageInfo;
    const { urlPath } = currentCollection;

    if (shouldShowStoreListLoader) {
      return <PageLoader />;
    }

    if (shouldShowNoFilteredResultPage) {
      return (
        <div className={styles.CollectionPageInfoCard}>
          <img className={styles.CollectionPageInfoCardImage} src={BeepNotResultImage} alt="store not found" />
          <p className={styles.CollectionPageInfoCardHeading}>
            <Trans t={t} i18nKey="FilterNotFoundStoreDescription" components={[<br />]} />
          </p>
        </div>
      );
    }

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
            loadMoreStores={() => loadStoreList(urlPath)}
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
    const { id, name, type, selected } = category;

    if (id === IDS.SORT_BY) {
      CleverTap.pushEvent('Collection Page - Click sort by button');
    } else {
      const attributes = { 'type of filter': name };

      if (type === TYPES.TOGGLE) {
        // Only record select state for toggle filters
        attributes['select state'] = !selected;
      }

      CleverTap.pushEvent('Collection Page - Click quick filter button', attributes);
    }

    const { setShippingType } = this.props;

    if (id === IDS.PICK_UP) {
      setShippingType({ shippingType: selected ? SHIPPING_TYPES.DELIVERY : SHIPPING_TYPES.PICKUP });
    }

    if (FILTER_DRAWER_SUPPORT_TYPES.includes(type)) {
      this.setState({ drawerInfo: { category } });
    } else {
      this.props.toggleCategorySelectStatus({ categoryId: id });
    }
  };

  handleClickResetAllCategoryButton = () => {
    const { resetSelectedOptionList, setShippingType } = this.props;
    resetSelectedOptionList({ key: FILTER_BACKUP_STORAGE_KEYS.COLLECTION });
    setShippingType({ shippingType: SHIPPING_TYPES.DELIVERY });
    CleverTap.pushEvent('Collection Page - Click reset quick sort and filter button');
  };

  handleCloseDrawer = () => {
    this.setState({ drawerInfo: { category: null } });
  };

  handleClickSingleChoiceOptionItem = (category, option) => {
    const { id: categoryId } = category;
    const { id: optionId, name: optionName } = option;

    if (categoryId === IDS.SORT_BY) {
      CleverTap.pushEvent('Collection Page - Select sort options (Sort button)', {
        'type of sort': optionName,
      });
    }

    this.props.updateCategoryOptionSelectStatus({ categoryId, optionIds: [optionId] });
    this.handleCloseDrawer();
  };

  handleClickResetOptionButton = category => {
    const { id: categoryId, name: filterName } = category;

    CleverTap.pushEvent('Collection Page - Reset (Filter slide-up)', {
      'type of filter': filterName,
    });

    this.props.resetCategoryAllOptionSelectStatus({ categoryId });
    this.handleCloseDrawer();
  };

  handleClickApplyAllOptionButton = (category, options) => {
    const { id: categoryId, name: filterName } = category;
    const optionNames = options
      .filter(option => option.selected)
      .map(option => option.name)
      .join(', ');
    const optionIds = options.filter(option => option.selected).map(option => option.id);

    CleverTap.pushEvent('Collection Page - Select filter options (Filter button)', {
      'type of filter': filterName,
      'filter options': optionNames,
    });

    this.props.updateCategoryOptionSelectStatus({ categoryId, optionIds });
    this.handleCloseDrawer();
  };

  renderDrawer = () => {
    const {
      drawerInfo: { category },
    } = this.state;
    const shouldShowDrawer = !!category;
    const title = _get(category, 'name', '');
    const type = _get(category, 'type', '');
    const shouldShowSingleChoiceSelector = type === TYPES.SINGLE_SELECT;
    const shouldShowMultipleChoiceSelector = type === TYPES.MULTI_SELECT;

    return (
      <Drawer
        className={styles.CollectionPageCategoryDrawerWrapper}
        show={shouldShowDrawer}
        onClose={this.handleCloseDrawer}
        style={{ maxHeight: '100%' }}
        header={
          <DrawerHeader
            left={
              <Button
                type="text"
                onClick={this.handleCloseDrawer}
                className={`${styles.CollectionPageCategoryDrawerHeaderButton} beep-text-reset`}
              >
                <X weight="light" className="tw-flex-shrink-0 tw-text-gray" size={24} />
              </Button>
            }
          >
            <span className={styles.CollectionPageCategoryDrawerHeaderTitle}>{title}</span>
          </DrawerHeader>
        }
      >
        {shouldShowSingleChoiceSelector ? (
          <SingleChoiceSelector category={category} onClick={this.handleClickSingleChoiceOptionItem} />
        ) : shouldShowMultipleChoiceSelector ? (
          <MultipleChoiceSelector
            category={category}
            onResetButtonClick={this.handleClickResetOptionButton}
            onApplyButtonClick={this.handleClickApplyAllOptionButton}
          />
        ) : null}
      </Drawer>
    );
  };

  handleFilterBarSwiper = swiper => {
    this.setState({ filterBarSwiperRef: swiper });
  };

  render() {
    const { currentCollection, categoryFilterList, shouldShowPageLoader, shouldShowResetButton } = this.props;
    if (shouldShowPageLoader) {
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
            onSwiper={this.handleFilterBarSwiper}
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
      shouldShowPageLoader: getShouldShowPageLoader(state),
      shouldShowStoreListLoader: getShouldShowStoreListLoader(state),
      filterOptionParams: getFilterOptionSearchParams(state),
      shouldShowNoFilteredResultPage: getShouldShowNoFilteredResultPage(state),
    }),
    dispatch => ({
      setPageInfo: bindActionCreators(setPageInfoThunkCreator, dispatch),
      resetPageInfo: bindActionCreators(resetPageInfoThunkCreator, dispatch),
      setShippingType: bindActionCreators(setShippingTypeThunkCreator, dispatch),
      resetShippingType: bindActionCreators(resetShippingTypeThunkCreator, dispatch),
      loadStoreList: bindActionCreators(loadStoreListThunkCreator, dispatch),
      resetStoreList: bindActionCreators(resetStoreListThunkCreator, dispatch),
      fetchAddressInfo: bindActionCreators(fetchAddressInfo, dispatch),
      loadSearchOptionList: bindActionCreators(loadSearchOptionListThunkCreator, dispatch),
      backUpSelectedOptionList: bindActionCreators(backUpSelectedOptionListThunkCreator, dispatch),
      resetSelectedOptionList: bindActionCreators(resetSelectedOptionListThunkCreator, dispatch),
      toggleCategorySelectStatus: bindActionCreators(toggleCategorySelectStatusThunkCreator, dispatch),
      updateCategoryOptionSelectStatus: bindActionCreators(updateCategoryOptionSelectStatusThunkCreator, dispatch),
      resetCategoryAllOptionSelectStatus: bindActionCreators(resetCategoryAllOptionSelectStatusThunkCreator, dispatch),
      rootActions: bindActionCreators(rootActionCreators, dispatch),
      appActions: bindActionCreators(appActionCreators, dispatch),
      collectionCardActions: bindActionCreators(collectionCardActionCreators, dispatch),
      homeActions: bindActionCreators(homeActionCreators, dispatch),
    })
  )
)(CollectionPage);
