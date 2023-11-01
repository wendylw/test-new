import React from 'react';
import PropTypes from 'prop-types';
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
import PageLoader from '../../components/PageLoader';
import DrawerHeader from '../../common/components/Drawer/DrawerHeader';
import Button from '../../common/components/Button';
import SingleChoiceSelector from '../components/OptionSelectors/SingleChoiceSelector';
import MultipleChoiceSelector from '../components/OptionSelectors/MultipleChoiceSelector';
import BeepNotResultImage from '../../images/beep-no-results.svg';
import { actions as searchActionCreators } from '../redux/modules/search';
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
  getShouldShowStoreListLoader,
  getShouldShowNoFilteredResultPage,
} from '../redux/modules/search/selectors';
import {
  setPageInfo as setPageInfoThunkCreator,
  resetPageInfo as resetPageInfoThunkCreator,
  setShippingType as setShippingTypeThunkCreator,
  resetShippingType as resetShippingTypeThunkCreator,
  loadStoreList as loadStoreListThunkCreator,
  resetStoreList as resetStoreListThunkCreator,
} from '../redux/modules/search/thunks';
import { submitStoreMenu } from '../home/utils';
import { getStoreLinkInfo, homeActionCreators } from '../redux/modules/home';
import { rootActionCreators, checkStateRestoreStatus } from '../redux/modules';
import { appActionCreators } from '../redux/modules/app';
import { getAddressInfo, getAddressCoords } from '../../redux/modules/address/selectors';
import { getAddressInfo as fetchAddressInfoThunk } from '../../redux/modules/address/thunks';
import { withAddressInfo } from '../ordering/containers/Location/withAddressInfo';
import {
  collectionCardActionCreators,
  getOtherCollections,
  getPopupCollections,
  getStorePageInfo,
} from '../redux/modules/entities/storeCollections';
import {
  getCategoryFilterList,
  getSelectedOptionList,
  getHasAnyCategorySelected,
} from '../redux/modules/filter/selectors';
import {
  loadSearchOptionList as loadSearchOptionListThunkCreator,
  loadSelectedOptionList as loadSelectedOptionListThunkCreator,
  backUpSelectedOptionList as backUpSelectedOptionListThunkCreator,
  resetSelectedOptionList as resetSelectedOptionListThunkCreator,
  toggleCategorySelectStatus as toggleCategorySelectStatusThunkCreator,
  updateCategoryOptionSelectStatus as updateCategoryOptionSelectStatusThunkCreator,
  resetCategoryAllOptionSelectStatus as resetCategoryAllOptionSelectStatusThunkCreator,
} from '../redux/modules/filter/thunks';
import { TYPES, IDS, FILTER_DRAWER_SUPPORT_TYPES, FILTER_BACKUP_STORAGE_KEYS } from '../redux/modules/filter/constants';
import { SHIPPING_TYPES } from '../../common/utils/constants';
import { isSameAddressCoords, scrollTopPosition } from '../utils';
import constants from '../../utils/constants';
import CleverTap from '../../utils/clevertap';
import prefetch from '../../common/utils/prefetch-assets';
import styles from './SearchPage.module.scss';

const { COLLECTIONS_TYPE } = constants;

class SearchPage extends React.Component {
  renderId = `${Date.now()}`;

  scrollTop = 0;

  sectionRef = React.createRef();

  debounceSearchStores = _debounce(async () => {
    const { resetPageInfo, loadStoreList } = this.props;

    await resetPageInfo();
    await loadStoreList();

    const { searchKeyword, searchResults } = this.props;

    CleverTap.pushEvent('Search - Perform search', {
      keyword: searchKeyword,
      'has results': searchResults.length > 0,
    });
  }, 700);

  constructor(props) {
    super(props);

    this.state = {
      drawerInfo: { category: null },
    };
  }

  componentDidMount = async () => {
    const {
      otherCollections,
      popularCollections,
      fetchAddressInfo,
      loadSearchOptionList,
      collectionCardActions,
      loadSelectedOptionList,
    } = this.props;
    if (!checkStateRestoreStatus()) {
      // Try to load option list from cache first then fetch from server
      await loadSearchOptionList({ key: FILTER_BACKUP_STORAGE_KEYS.SEARCH });
      await this.resetSearchData();
      if (otherCollections.length === 0) {
        collectionCardActions.getCollections(COLLECTIONS_TYPE.OTHERS);
      }
      if (popularCollections.length === 0) {
        collectionCardActions.getCollections(COLLECTIONS_TYPE.POPULAR);
      }
    } else {
      // BEEP-2532: The purpose for reloading selected option list is to force swiper to recalculate number of slides and their offsets.
      await loadSelectedOptionList({ key: FILTER_BACKUP_STORAGE_KEYS.SEARCH });
      // Silently fetch address Info without blocking current process
      fetchAddressInfo();
    }

    prefetch(['SITE_HM', 'ORD_MNU'], ['SiteHome', 'OrderingDelivery']);
  };

  componentDidUpdate = async prevProps => {
    const { addressCoords: prevAddressCoords, selectedOptionList: prevSelectedOptionList } = prevProps;
    const {
      addressCoords: currAddressCoords,
      selectedOptionList: currSelectedOptionList,
      searchKeyword,
      resetPageInfo,
      loadStoreList,
      collectionCardActions,
      backUpSelectedOptionList,
    } = this.props;

    const hasAddressCoordsChanged = !isSameAddressCoords(prevAddressCoords, currAddressCoords);
    const hasSelectedOptionListChanged = prevSelectedOptionList !== currSelectedOptionList;
    const shouldReloadStoreList = searchKeyword && (hasAddressCoordsChanged || hasSelectedOptionListChanged);

    if (hasAddressCoordsChanged) {
      // Reload other and popular collections once address changed
      collectionCardActions.getCollections(COLLECTIONS_TYPE.OTHERS);
      collectionCardActions.getCollections(COLLECTIONS_TYPE.POPULAR);
    }

    if (shouldReloadStoreList) {
      scrollTopPosition(this.sectionRef.current);
      await resetPageInfo();
      loadStoreList();
    }

    if (hasSelectedOptionListChanged) {
      backUpSelectedOptionList({ key: FILTER_BACKUP_STORAGE_KEYS.SEARCH });
    }
  };

  componentWillUnmount = () => {
    // Reset filter redux data state when user leaves the page in below 2 cases:
    // 1. User directly clicks the back button from browser
    // 2. User directly clicks the back button from the collection page
    const { resetSelectedOptionList } = this.props;

    resetSelectedOptionList({ key: FILTER_BACKUP_STORAGE_KEYS.SEARCH });
  };

  resetSearchData = async () => {
    const { categoryFilterList, resetPageInfo, setShippingType } = this.props;
    const pickupFilter = categoryFilterList.find(filter => filter.id === IDS.PICK_UP);
    await resetPageInfo();
    await setShippingType({ shippingType: pickupFilter?.selected ? SHIPPING_TYPES.PICKUP : SHIPPING_TYPES.DELIVERY });
  };

  onGoBack = () => {
    const { searchKeyword, searchActions, resetShippingType, resetPageInfo, resetStoreList, history } = this.props;

    if (!searchKeyword) {
      CleverTap.pushEvent('Empty Search - Click back');
    } else {
      CleverTap.pushEvent('Search - click back');
    }

    history.push({
      pathname: '/home',
    });

    // Reset search data state
    searchActions.resetSearchInfo();
    resetShippingType();
    resetStoreList();
    resetPageInfo();
  };

  handleSearchTextChange = event => {
    const keyword = event.currentTarget.value;
    const { searchActions, setPageInfo } = this.props;

    searchActions.setSearchInfo({ keyword });
    setPageInfo({ scrollTop: 0 });
    this.debounceSearchStores();
  };

  handleClearSearchText = () => {
    const { searchActions, setPageInfo } = this.props;

    CleverTap.pushEvent('Search - Click clear search field');
    searchActions.resetSearchInfo();
    setPageInfo({ scrollTop: 0 });
  };

  backupState = () => {
    const { rootActions } = this.props;

    rootActions.backup();
  };

  backLeftPosition = async store => {
    const { setPageInfo, shippingType, addressInfo } = this.props;
    setPageInfo({ scrollTop: this.scrollTop });
    this.backupState();
    await submitStoreMenu({
      deliveryAddress: addressInfo,
      store,
      source: document.location.href,
      shippingType,
    });
  };

  handleLoadCollections = () => {
    const { collectionCardActions } = this.props;

    return collectionCardActions.getCollections(COLLECTIONS_TYPE.OTHERS);
  };

  handleClickCategoryButton = category => {
    const { id, name, type, selected } = category;
    const { searchKeyword, setShippingType, toggleCategorySelectStatus } = this.props;

    if (id === IDS.SORT_BY) {
      CleverTap.pushEvent('Search - Click sort by button', {
        'search keyword': searchKeyword,
      });
    } else {
      const attributes = { 'type of filter': name };

      if (type === TYPES.TOGGLE) {
        // Only record select state for toggle filters
        attributes['select state'] = !selected;
      }

      CleverTap.pushEvent('Search - Click quick filter button', attributes);
    }

    if (id === IDS.PICK_UP) {
      setShippingType({ shippingType: selected ? SHIPPING_TYPES.DELIVERY : SHIPPING_TYPES.PICKUP });
    }

    if (FILTER_DRAWER_SUPPORT_TYPES.includes(type)) {
      this.setState({ drawerInfo: { category } });
    } else {
      toggleCategorySelectStatus({ categoryId: id });
    }
  };

  handleClickResetAllCategoryButton = async () => {
    const { resetSelectedOptionList, setShippingType } = this.props;
    await setShippingType({ shippingType: SHIPPING_TYPES.DELIVERY });
    await resetSelectedOptionList({ key: FILTER_BACKUP_STORAGE_KEYS.SEARCH });
    CleverTap.pushEvent('Search - Click reset quick sort and filter button');
  };

  handleCloseDrawer = () => {
    this.setState({ drawerInfo: { category: null } });
  };

  handleClickSingleChoiceOptionItem = (category, option) => {
    const { id: categoryId } = category;
    const { id: optionId, name: optionName } = option;
    const { updateCategoryOptionSelectStatus } = this.props;

    if (categoryId === IDS.SORT_BY) {
      CleverTap.pushEvent('Search - Select sort option (Sort button)', {
        'type of sort': optionName,
      });
    }

    updateCategoryOptionSelectStatus({ categoryId, optionIds: [optionId] });
    this.handleCloseDrawer();
  };

  handleClickResetOptionButton = category => {
    const { id: categoryId, name: filterName } = category;
    const { resetCategoryAllOptionSelectStatus } = this.props;

    CleverTap.pushEvent('Search - Reset (Filter slide-up)', {
      'type of filter': filterName,
    });

    resetCategoryAllOptionSelectStatus({ categoryId });
    this.handleCloseDrawer();
  };

  handleClickApplyAllOptionButton = (category, options) => {
    const { id: categoryId, name: filterName } = category;
    const optionNames = options
      .filter(option => option.selected)
      .map(option => option.name)
      .join(', ');
    const optionIds = options.filter(option => option.selected).map(option => option.id);

    CleverTap.pushEvent('Search - Select filter options (Filter button)', {
      'type of filter': filterName,
      'filter options': optionNames,
    });

    const { updateCategoryOptionSelectStatus } = this.props;

    updateCategoryOptionSelectStatus({ categoryId, optionIds });
    this.handleCloseDrawer();
  };

  renderStoreList() {
    const {
      t,
      stores,
      pageInfo,
      searchKeyword,
      storePageInfo,
      loadStoreList,
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
      return <PageLoader />;
    }

    const shouldShowNoResultPage = shouldShowNoSearchResultPage || shouldShowNoFilteredResultPage;

    return (
      <>
        {shouldShowCategories && (
          <div>
            <StoreListAutoScroll
              getScrollParent={() => this.sectionRef.current}
              defaultScrollTop={pageInfo.scrollTop}
              onScroll={top => {
                this.scrollTop = top;
              }}
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
              onScroll={top => {
                this.scrollTop = top;
              }}
            >
              <StoreList
                key={`store-list-${this.renderId}`}
                stores={stores}
                hasMore={pageInfo.hasMore}
                getScrollParent={() => this.sectionRef.current}
                loadMoreStores={() => loadStoreList()}
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
      </>
    );
  }

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
        style={{ maxHeight: '100%' }}
        header={
          <DrawerHeader
            left={
              <Button
                type="text"
                theme="ghost"
                data-test-id="site.search.drawer.close-btn"
                onClick={this.handleCloseDrawer}
                className={styles.SearchPageCategoryDrawerHeaderButton}
                contentClassName={styles.SearchPageCategoryDrawerHeaderButtonContent}
              >
                <X weight="light" className="tw-flex-shrink-0 tw-text-2xl tw-text-gray" />
              </Button>
            }
          >
            <span className={styles.SearchPageCategoryDrawerHeaderTitle}>{title}</span>
          </DrawerHeader>
        }
      >
        {shouldShowSingleChoiceSelector ? (
          <SingleChoiceSelector
            category={category}
            onClick={this.handleClickSingleChoiceOptionItem}
            data-test-id="site.search.drawer.option-selector.apply-btn"
          />
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
      <main className="fixed-wrapper fixed-wrapper__main" data-test-id="site.search.container">
        <div className="tw-sticky tw-top-0 tw-z-100 tw-w-full tw-bg-white">
          <header
            className={`${styles.SearchPageHeaderWrapper} ${
              shouldShowFilterBar ? '' : 'tw-border-0 tw-border-b tw-border-solid tw-border-gray-200'
            }`}
          >
            <button
              className={styles.SearchPageIconWrapper}
              onClick={this.onGoBack}
              data-test-id="site.search.back-btn"
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

SearchPage.propTypes = {
  shippingType: PropTypes.string,
  searchKeyword: PropTypes.string,
  /* eslint-disable react/forbid-prop-types */
  stores: PropTypes.array,
  pageInfo: PropTypes.object,
  addressInfo: PropTypes.object,
  storePageInfo: PropTypes.object,
  searchResults: PropTypes.array,
  otherCollections: PropTypes.array,
  popularCollections: PropTypes.array,
  selectedOptionList: PropTypes.object,
  categoryFilterList: PropTypes.array,
  /* eslint-enable */
  shouldShowFilterBar: PropTypes.bool,
  shouldShowStoreList: PropTypes.bool,
  shouldShowCategories: PropTypes.bool,
  shouldShowResetButton: PropTypes.bool,
  shouldShowStoreListLoader: PropTypes.bool,
  shouldShowStartSearchPage: PropTypes.bool,
  shouldShowNoSearchResultPage: PropTypes.bool,
  shouldShowNoFilteredResultPage: PropTypes.bool,
  setPageInfo: PropTypes.func,
  resetPageInfo: PropTypes.func,
  loadStoreList: PropTypes.func,
  resetStoreList: PropTypes.func,
  setShippingType: PropTypes.func,
  fetchAddressInfo: PropTypes.func,
  resetShippingType: PropTypes.func,
  loadSearchOptionList: PropTypes.func,
  loadSelectedOptionList: PropTypes.func,
  resetSelectedOptionList: PropTypes.func,
  backUpSelectedOptionList: PropTypes.func,
  toggleCategorySelectStatus: PropTypes.func,
  updateCategoryOptionSelectStatus: PropTypes.func,
  resetCategoryAllOptionSelectStatus: PropTypes.func,
  addressCoords: PropTypes.shape({
    lat: PropTypes.number,
    lng: PropTypes.number,
  }),
  rootActions: PropTypes.shape({
    backup: PropTypes.func,
  }),
  searchActions: PropTypes.shape({
    setSearchInfo: PropTypes.func,
    resetSearchInfo: PropTypes.func,
  }),
  collectionCardActions: PropTypes.shape({
    getCollections: PropTypes.func,
  }),
};

SearchPage.defaultProps = {
  stores: [],
  shippingType: '',
  searchKeyword: '',
  searchResults: [],
  otherCollections: [],
  popularCollections: [],
  selectedOptionList: null,
  categoryFilterList: [],
  shouldShowFilterBar: false,
  shouldShowStoreList: false,
  shouldShowCategories: false,
  shouldShowResetButton: false,
  shouldShowStoreListLoader: false,
  shouldShowStartSearchPage: false,
  shouldShowNoSearchResultPage: false,
  shouldShowNoFilteredResultPage: false,
  setPageInfo: () => {},
  resetPageInfo: () => {},
  loadStoreList: () => {},
  resetStoreList: () => {},
  setShippingType: () => {},
  fetchAddressInfo: () => {},
  resetShippingType: () => {},
  loadSearchOptionList: () => {},
  loadSelectedOptionList: () => {},
  resetSelectedOptionList: () => {},
  backUpSelectedOptionList: () => {},
  toggleCategorySelectStatus: () => {},
  updateCategoryOptionSelectStatus: () => {},
  resetCategoryAllOptionSelectStatus: () => {},
  pageInfo: null,
  addressInfo: null,
  addressCoords: null,
  storePageInfo: null,
  rootActions: {
    backup: () => {},
  },
  searchActions: {
    setSearchInfo: () => {},
    resetSearchInfo: () => {},
  },
  collectionCardActions: {
    getCollections: () => {},
  },
};

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
      selectedOptionList: getSelectedOptionList(state),
      shouldShowResetButton: getHasAnyCategorySelected(state),
    }),
    dispatch => ({
      setPageInfo: bindActionCreators(setPageInfoThunkCreator, dispatch),
      resetPageInfo: bindActionCreators(resetPageInfoThunkCreator, dispatch),
      setShippingType: bindActionCreators(setShippingTypeThunkCreator, dispatch),
      resetShippingType: bindActionCreators(resetShippingTypeThunkCreator, dispatch),
      loadStoreList: bindActionCreators(loadStoreListThunkCreator, dispatch),
      resetStoreList: bindActionCreators(resetStoreListThunkCreator, dispatch),
      fetchAddressInfo: bindActionCreators(fetchAddressInfoThunk, dispatch),
      loadSearchOptionList: bindActionCreators(loadSearchOptionListThunkCreator, dispatch),
      loadSelectedOptionList: bindActionCreators(loadSelectedOptionListThunkCreator, dispatch),
      backUpSelectedOptionList: bindActionCreators(backUpSelectedOptionListThunkCreator, dispatch),
      resetSelectedOptionList: bindActionCreators(resetSelectedOptionListThunkCreator, dispatch),
      toggleCategorySelectStatus: bindActionCreators(toggleCategorySelectStatusThunkCreator, dispatch),
      updateCategoryOptionSelectStatus: bindActionCreators(updateCategoryOptionSelectStatusThunkCreator, dispatch),
      resetCategoryAllOptionSelectStatus: bindActionCreators(resetCategoryAllOptionSelectStatusThunkCreator, dispatch),
      rootActions: bindActionCreators(rootActionCreators, dispatch),
      appActions: bindActionCreators(appActionCreators, dispatch),
      homeActions: bindActionCreators(homeActionCreators, dispatch),
      searchActions: bindActionCreators(searchActionCreators, dispatch),
      collectionCardActions: bindActionCreators(collectionCardActionCreators, dispatch),
    })
  )
)(SearchPage);
