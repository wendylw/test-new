import React from 'react';
import { bindActionCreators, compose } from 'redux';
import { connect } from 'react-redux';
import { withTranslation, Trans } from 'react-i18next';
import _debounce from 'lodash/debounce';
import { CaretLeft, X } from 'phosphor-react';
import _get from 'lodash/get';
import SearchBox from '../components/SearchBox';
import StoreListAutoScroll from '../components/StoreListAutoScroll';
import StoreList from '../components/StoreList';
import EmptySearch from './components/EmptySearch';
import FilterBar from '../components/FilterBar';
import Drawer from '../../common/components/Drawer';
import DrawerHeader from '../../common/components/Drawer/DrawerHeader';
import Button from '../../common/components/Button';
import SingleChoiceSelector from '../components/OptionSelectors/SingleChoiceSelector';
import MultipleChoiceSelector from '../components/OptionSelectors/MultipleChoiceSelector';
import BeepNotResultImage from '../../images/beep-no-results.svg';
import { actions as searchActions } from '../redux/modules/search';
import {
  getStoreList,
  getShippingType,
  getPageInfo,
  getSearchKeyword,
  getSearchResults,
  getShouldShowCategories,
  getShouldShowFilterBar,
  getShouldShowStartSearchPage,
  getShouldShowNoSearchResultPage,
  getShouldShowStoreList,
  getShouldLoadStoreList,
  getShouldShowStoreListLoader,
  getShouldShowNoFilteredResultPage,
} from '../redux/modules/search/selectors';
import { resetPageInfo, setShippingType, loadStoreList } from '../redux/modules/search/thunks';
import { submitStoreMenu } from '../home/utils';
import { getStoreLinkInfo, homeActionCreators } from '../redux/modules/home';
import { rootActionCreators } from '../redux/modules';
import { appActionCreators } from '../redux/modules/app';
import { getAddressInfo, getAddressCoords } from '../../redux/modules/address/selectors';
import { getAddressInfo as fetchAddressInfo } from '../../redux/modules/address/thunks';
import { checkStateRestoreStatus } from '../redux/modules/index';
import { withAddressInfo } from '../ordering/containers/Location/withAddressInfo';
import {
  collectionCardActionCreators,
  getOtherCollections,
  getPopupCollections,
  getStorePageInfo,
} from '../redux/modules/entities/storeCollections';
import { actions as filterActionCreators } from '../redux/modules/filter';
import {
  getCategoryFilterList,
  getHasAnyCategorySelected,
  getFilterOptionSearchParams,
} from '../redux/modules/filter/selectors';
import { loadSearchOptionList, backUpSearchOptionList, resetSearchOptionList } from '../redux/modules/filter/thunks';
import { TYPES, IDS, FILTER_DRAWER_SUPPORT_TYPES, FILTER_BACKUP_STORAGE_KEYS } from '../redux/modules/filter/constants';
import { SHIPPING_TYPES } from '../../common/utils/constants';
import { isSameAddressCoords, scrollTopPosition } from '../utils';
import constants from '../../utils/constants';
import CleverTap from '../../utils/clevertap';
import styles from './SearchPage.module.scss';

const { COLLECTIONS_TYPE } = constants;

class SearchPage extends React.Component {
  renderId = `${Date.now()}`;
  scrollTop = 0;
  sectionRef = React.createRef();

  state = {
    drawerInfo: { category: null },
  };

  componentDidMount = async () => {
    const { otherCollections, popularCollections, fetchAddressInfo, loadSearchOptionList } = this.props;
    if (!checkStateRestoreStatus()) {
      await this.resetSearchData();
      // Try to load option list from cache first then fetch from server
      await loadSearchOptionList({ key: FILTER_BACKUP_STORAGE_KEYS.SEARCH });
      if (otherCollections.length === 0) {
        this.props.collectionCardActions.getCollections(COLLECTIONS_TYPE.OTHERS);
      }
      if (popularCollections.length === 0) {
        this.props.collectionCardActions.getCollections(COLLECTIONS_TYPE.POPULAR);
      }
    } else {
      // Silently fetch address Info without blocking current process
      fetchAddressInfo();
    }
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
      searchKeyword,
      resetPageInfo,
    } = this.props;

    const hasAddressCoordsChanged = !isSameAddressCoords(prevAddressCoords, currAddressCoords);
    const hasFilterOptionParamsChanged = prevFilterOptionParams !== currFilterOptionParams;
    // Exclude shipping type is null for avoiding store list reloading sake.
    const hasShippingTypeChanged = !!prevShippingType && prevShippingType !== currShippingType;
    const shouldReloadStoreList =
      searchKeyword && (hasAddressCoordsChanged || hasFilterOptionParamsChanged || hasShippingTypeChanged);

    if (hasAddressCoordsChanged) {
      // Reload other and popular collections once address changed
      this.props.collectionCardActions.getCollections(COLLECTIONS_TYPE.OTHERS);
      this.props.collectionCardActions.getCollections(COLLECTIONS_TYPE.POPULAR);
    }

    if (shouldReloadStoreList) {
      scrollTopPosition(this.sectionRef.current);
      await resetPageInfo();
      this.loadStoreListIfNeeded();
    }

    // Pickup filter is not included in the filter option params so we need to check shipping type separately
    if (hasFilterOptionParamsChanged || hasShippingTypeChanged) {
      this.props.backUpSearchOptionList({ key: FILTER_BACKUP_STORAGE_KEYS.SEARCH });
    }
  };

  resetSearchData = async () => {
    const { categoryFilterList, resetPageInfo, setShippingType } = this.props;
    const pickupFilter = categoryFilterList.find(filter => filter.id === IDS.PICK_UP);
    await resetPageInfo();
    await setShippingType({ shippingType: pickupFilter?.selected ? SHIPPING_TYPES.PICKUP : SHIPPING_TYPES.DELIVERY });
  };

  loadStoreListIfNeeded = async () => {
    const { shouldLoadStoreList, loadStoreList } = this.props;

    if (!shouldLoadStoreList) return;

    await loadStoreList();
  };

  onGoBack = () => {
    const { searchKeyword, searchActions, resetPageInfo } = this.props;

    if (!searchKeyword) {
      CleverTap.pushEvent('Empty Search - Click back');
    } else {
      CleverTap.pushEvent('Search - click back');
    }

    this.props.history.push({
      pathname: '/home',
    });

    // Reset all search & filter redux data state
    searchActions.setSearchInfo({ keyword: '' });
    searchActions.resetShippingType();
    searchActions.resetStoreListInfo();
    resetPageInfo();
    this.props.resetSearchOptionList({ key: FILTER_BACKUP_STORAGE_KEYS.SEARCH });
  };

  debounceSearchStores = _debounce(async () => {
    await this.props.resetPageInfo();
    await this.loadStoreListIfNeeded();
    const { searchKeyword, searchResults } = this.props;
    CleverTap.pushEvent('Search - Perform search', {
      keyword: searchKeyword,
      'has results': searchResults.length > 0,
    });
  }, 700);

  handleSearchTextChange = event => {
    const keyword = event.currentTarget.value;
    this.props.searchActions.setSearchInfo({ keyword });
    this.props.searchActions.setPageInfo({ scrollTop: 0 });
    this.debounceSearchStores();
  };

  handleClearSearchText = () => {
    CleverTap.pushEvent('Search - Click clear search field');
    this.props.searchActions.setSearchInfo({ keyword: '' });
    this.props.searchActions.setPageInfo({ scrollTop: 0 });
  };

  backupState = () => {
    this.props.rootActions.backup();
  };

  backLeftPosition = async store => {
    const { searchActions, shippingType, addressInfo } = this.props;
    searchActions.setPageInfo({ scrollTop: this.scrollTop });
    this.backupState();
    await submitStoreMenu({
      deliveryAddress: addressInfo,
      store: store,
      source: document.location.href,
      shippingType,
    });
  };

  handleLoadCollections = () => {
    return this.props.collectionCardActions.getCollections(COLLECTIONS_TYPE.OTHERS);
  };

  renderStoreList() {
    const {
      t,
      stores,
      pageInfo,
      searchKeyword,
      storePageInfo,
      popularCollections,
      otherCollections,
      shouldShowCategories,
      shouldShowStartSearchPage,
      shouldShowNoSearchResultPage,
      shouldShowNoFilteredResultPage,
      shouldShowStoreList,
      shouldShowStoreListLoader,
    } = this.props;

    if (shouldShowStoreListLoader) {
      return <div className="entry-home__huge-loader loader theme text-size-huge" />;
    }

    const shouldShowNoResultPage = shouldShowNoSearchResultPage || shouldShowNoFilteredResultPage;

    return (
      <React.Fragment>
        {shouldShowCategories && (
          <div>
            <StoreListAutoScroll
              getScrollParent={() => this.sectionRef.current}
              defaultScrollTop={pageInfo.scrollTop}
              onScroll={scrollTop => (this.scrollTop = scrollTop)}
            >
              <EmptySearch
                populars={popularCollections}
                others={otherCollections}
                hasMore={storePageInfo.hasMore}
                getScrollParent={() => this.sectionRef.current}
                loadCollections={this.handleLoadCollections}
              />
            </StoreListAutoScroll>
          </div>
        )}
        {shouldShowStartSearchPage && (
          <div className={styles.SearchPageInfoCard}>
            <img className={styles.SearchPageInfoCardImage} src={BeepNotResultImage} alt="start search store" />
            <p className={styles.SearchPageInfoCardHeading}>{t('StartSearchDescription')}</p>
          </div>
        )}
        {shouldShowNoResultPage && (
          <div className={styles.SearchPageInfoCard}>
            <img className={styles.SearchPageInfoCardImage} src={BeepNotResultImage} alt="store not found" />
            <p className={styles.SearchPageInfoCardHeading}>
              {shouldShowNoFilteredResultPage ? (
                <Trans t={t} i18nKey="FilterNotFoundStoreDescription" components={[<br />]} />
              ) : (
                <Trans
                  t={t}
                  i18nKey="SearchNotFoundStoreDescription"
                  values={{ keyword: searchKeyword }}
                  components={[<br />]}
                />
              )}
            </p>
          </div>
        )}
        {shouldShowStoreList ? (
          <div className="sm:tw-py-4px tw-py-4 tw-bg-white">
            <StoreListAutoScroll
              getScrollParent={() => this.sectionRef.current}
              defaultScrollTop={pageInfo.scrollTop}
              onScroll={scrollTop => (this.scrollTop = scrollTop)}
            >
              <StoreList
                key={`store-list-${this.renderId}`}
                stores={stores}
                hasMore={pageInfo.hasMore}
                getScrollParent={() => this.sectionRef.current}
                loadMoreStores={() => this.loadStoreListIfNeeded()}
                onStoreClicked={(store, index) => {
                  CleverTap.pushEvent('Search - Click search result', {
                    keyword: searchKeyword,
                    'store name': store.name,
                    'store rank': index + 1,
                    'shipping type': store.shippingType,
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
        ) : null}
      </React.Fragment>
    );
  }

  handleClickCategoryButton = category => {
    const { id, type, selected } = category;
    const { searchKeyword, setShippingType, filterActions } = this.props;

    if (id === IDS.SORT_BY) {
      CleverTap.pushEvent('Search - Click sort by button', {
        'search keyword': searchKeyword,
      });
    } else {
      CleverTap.pushEvent('Search - Click quick filter button');
    }

    if (id === IDS.PICK_UP) {
      setShippingType({ shippingType: selected ? SHIPPING_TYPES.DELIVERY : SHIPPING_TYPES.PICKUP });
    }

    if (FILTER_DRAWER_SUPPORT_TYPES.includes(type)) {
      this.setState({ drawerInfo: { category } });
    } else {
      filterActions.updateCategorySelectStatus({ id });
    }
  };

  handleClickResetAllCategoryButton = () => {
    const { resetSearchOptionList, setShippingType } = this.props;
    resetSearchOptionList({ key: FILTER_BACKUP_STORAGE_KEYS.SEARCH });
    setShippingType({ shippingType: SHIPPING_TYPES.DELIVERY });
    CleverTap.pushEvent('Search - Click reset quick sort and filter button');
  };

  handleCloseDrawer = () => {
    this.setState({ drawerInfo: { category: null } });
  };

  handleClickSingleChoiceOptionItem = (category, option) => {
    const { id: categoryId } = category;
    const { name: optionName } = option;

    if (categoryId === IDS.SORT_BY) {
      CleverTap.pushEvent('Search - Select sort options (Sort button)', {
        'type of sort': optionName,
      });
    }

    this.props.filterActions.updateCategoryOptionSelectStatus({ categoryId, option });
    this.handleCloseDrawer();
  };

  handleClickResetOptionButton = category => {
    const { id: categoryId, name: filterName } = category;

    CleverTap.pushEvent('Search - Reset (Filter slide-up)', {
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

    CleverTap.pushEvent('Search - Select filter options (Filter button)', {
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
    const type = _get(category, 'type', '');
    const shouldShowSingleChoiceSelector = type === TYPES.SINGLE_SELECT;
    const shouldShowMultipleChoiceSelector = type === TYPES.MULTI_SELECT;

    return (
      <Drawer
        className={styles.SearchPageCategoryDrawerWrapper}
        show={shouldShowDrawer}
        onClose={this.handleCloseDrawer}
        style={{ maxHeight: '99.8%' }}
        header={
          <DrawerHeader
            left={
              <Button
                type="text"
                onClick={this.handleCloseDrawer}
                className={`${styles.SearchPageCategoryDrawerHeaderButton} beep-text-reset`}
              >
                <X weight="light" className="tw-flex-shrink-0 tw-text-gray" size={24} />
              </Button>
            }
          >
            <span className={styles.SearchPageCategoryDrawerHeaderTitle}>{title}</span>
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

  render() {
    const { searchKeyword, shouldShowFilterBar, categoryFilterList, shouldShowResetButton } = this.props;
    return (
      <main className="fixed-wrapper fixed-wrapper__main" data-heap-name="site.search.container">
        <div className="tw-sticky tw-top-0 tw-z-100 tw-w-full tw-bg-white">
          <header
            className={`${styles.SearchPageHeaderWrapper} ${
              shouldShowFilterBar ? '' : 'tw-border-0 tw-border-b tw-border-solid tw-border-gray-200'
            }`}
          >
            <button
              className={styles.SearchPageIconWrapper}
              onClick={this.onGoBack}
              data-heap-name="site.search.back-btn"
            >
              <CaretLeft size={24} weight="light" />
            </button>
            <SearchBox
              keyword={searchKeyword}
              handleSearchTextChange={this.handleSearchTextChange}
              handleClearSearchText={this.handleClearSearchText}
            />
          </header>
          {shouldShowFilterBar && (
            <FilterBar
              className={styles.SearchPageFilterBarWrapper}
              categories={categoryFilterList}
              shouldShowResetButton={shouldShowResetButton}
              onResetButtonClick={this.handleClickResetAllCategoryButton}
              onCategoryButtonClick={this.handleClickCategoryButton}
            />
          )}
        </div>
        <section ref={this.sectionRef} className="entry-home fixed-wrapper__container wrapper">
          {this.renderStoreList()}
        </section>
        {this.renderDrawer()}
      </main>
    );
  }
}
SearchPage.displayName = 'SearchPage';

export default compose(
  withAddressInfo(),
  withTranslation(),
  connect(
    state => ({
      pageInfo: getPageInfo(state),
      stores: getStoreList(state),
      shippingType: getShippingType(state),
      storeLinkInfo: getStoreLinkInfo(state),
      addressInfo: getAddressInfo(state),
      searchKeyword: getSearchKeyword(state),
      searchResults: getSearchResults(state),
      storePageInfo: getStorePageInfo(state),
      otherCollections: getOtherCollections(state),
      popularCollections: getPopupCollections(state),
      addressCoords: getAddressCoords(state),
      shouldShowCategories: getShouldShowCategories(state),
      shouldShowFilterBar: getShouldShowFilterBar(state),
      shouldShowStartSearchPage: getShouldShowStartSearchPage(state),
      shouldShowNoSearchResultPage: getShouldShowNoSearchResultPage(state),
      shouldShowNoFilteredResultPage: getShouldShowNoFilteredResultPage(state),
      shouldShowStoreListLoader: getShouldShowStoreListLoader(state),
      shouldShowStoreList: getShouldShowStoreList(state),
      categoryFilterList: getCategoryFilterList(state),
      shouldShowResetButton: getHasAnyCategorySelected(state),
      filterOptionParams: getFilterOptionSearchParams(state),
      shouldLoadStoreList: getShouldLoadStoreList(state),
    }),
    dispatch => ({
      resetPageInfo: bindActionCreators(resetPageInfo, dispatch),
      setShippingType: bindActionCreators(setShippingType, dispatch),
      loadStoreList: bindActionCreators(loadStoreList, dispatch),
      fetchAddressInfo: bindActionCreators(fetchAddressInfo, dispatch),
      loadSearchOptionList: bindActionCreators(loadSearchOptionList, dispatch),
      backUpSearchOptionList: bindActionCreators(backUpSearchOptionList, dispatch),
      resetSearchOptionList: bindActionCreators(resetSearchOptionList, dispatch),
      rootActions: bindActionCreators(rootActionCreators, dispatch),
      appActions: bindActionCreators(appActionCreators, dispatch),
      searchActions: bindActionCreators(searchActions, dispatch),
      homeActions: bindActionCreators(homeActionCreators, dispatch),
      collectionCardActions: bindActionCreators(collectionCardActionCreators, dispatch),
      filterActions: bindActionCreators(filterActionCreators, dispatch),
    })
  )
)(SearchPage);
