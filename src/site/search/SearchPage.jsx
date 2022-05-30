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
import Button from '../../common/components/Button';
import OptionSelector from '../components/OptionSelector';
import BeepNotResultImage from '../../images/beep-no-results.svg';
import {
  searchActions,
  getStoreList,
  getShippingType,
  getPageInfo,
  getSearchInfo,
  loadedSearchingStores,
  getShouldShowCategories,
  getShouldShowFilterBar,
  getShouldShowStartSearchPage,
  getShouldShowNoSearchResultPage,
  getShouldShowStoreList,
} from '../redux/modules/search';
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
      this.resetSearchData();
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
    const { addressCoords: prevAddressCoords, filterOptionParams: prevFilterOptionParams } = prevProps;
    const { addressCoords: currAddressCoords, filterOptionParams: currFilterOptionParams } = this.props;

    const hasFilterOptionParamsChanged = prevFilterOptionParams !== currFilterOptionParams;

    if (!isSameAddressCoords(prevAddressCoords, currAddressCoords)) {
      scrollTopPosition(this.sectionRef.current);
      this.resetSearchData();
      // Reload other and popular collections once address changed
      this.props.collectionCardActions.getCollections(COLLECTIONS_TYPE.OTHERS);
      this.props.collectionCardActions.getCollections(COLLECTIONS_TYPE.POPULAR);
    }

    if (hasFilterOptionParamsChanged) {
      this.props.backUpSearchOptionList({ key: FILTER_BACKUP_STORAGE_KEYS.SEARCH });
    }
  };

  resetSearchData = () => {
    const { searchActions } = this.props;
    searchActions.setShippingType('delivery');
    searchActions.setSearchInfo({ keyword: '', scrollTop: 0 });
  };

  onGoBack = () => {
    const {
      searchInfo: { keyword },
    } = this.props;

    if (!keyword) {
      CleverTap.pushEvent('Empty Search - Click back');
    } else {
      CleverTap.pushEvent('Search - click back');
    }

    this.props.history.push({
      pathname: '/home',
    });

    this.props.resetSearchOptionList({ key: FILTER_BACKUP_STORAGE_KEYS.SEARCH });
  };

  debounceSearchStores = _debounce(() => {
    this.props.searchActions.setPaginationInfo();
    this.props.searchActions.getStoreList();
  }, 700);

  handleSearchTextChange = event => {
    const keyword = event.currentTarget.value;
    this.props.searchActions.setSearchingStoresStatus(false);
    this.props.searchActions.setSearchInfo({ keyword, scrollTop: 0 });
    this.debounceSearchStores();
  };

  handleClearSearchText = () => {
    CleverTap.pushEvent('Search - Click clear search field');
    this.props.searchActions.setSearchInfo({ keyword: '', scrollTop: 0 });
  };

  backupState = () => {
    this.props.rootActions.backup();
  };

  backLeftPosition = async store => {
    const { searchActions, shippingType, addressInfo } = this.props;
    searchActions.setSearchInfo({ scrollTop: this.scrollTop });
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
      searchInfo,
      loadedSearchingStores,
      storePageInfo,
      popularCollections,
      otherCollections,
      shouldShowCategories,
      shouldShowStartSearchPage,
      shouldShowNoSearchResultPage,
      shouldShowStoreList,
    } = this.props;
    const { keyword, scrollTop } = searchInfo;

    if (Boolean(keyword) && !loadedSearchingStores) {
      return <div className="entry-home__huge-loader loader theme text-size-huge" />;
    }

    return (
      <React.Fragment>
        {shouldShowCategories && (
          <div>
            <StoreListAutoScroll
              getScrollParent={() => this.sectionRef.current}
              defaultScrollTop={scrollTop}
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
        {shouldShowNoSearchResultPage && (
          <div className={styles.SearchPageInfoCard}>
            <img className={styles.SearchPageInfoCardImage} src={BeepNotResultImage} alt="store not found" />
            <p className={styles.SearchPageInfoCardHeading}>
              <Trans t={t} i18nKey="SearchNotFoundStoreDescription" values={{ keyword }} components={[<br />]} />
            </p>
          </div>
        )}
        {shouldShowStoreList ? (
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
                loadMoreStores={() => this.props.searchActions.getStoreList()}
                onStoreClicked={(store, index) => {
                  CleverTap.pushEvent('Search - Click search result', {
                    keyword: keyword,
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
    const { id, type } = category;
    const {
      searchInfo: { keyword },
    } = this.props;

    if (id === IDS.SORT_BY) {
      CleverTap.pushEvent('Search - Click sort by button', {
        'search keyword': keyword,
      });
    } else {
      CleverTap.pushEvent('Search - Click quick filter button');
    }

    if (FILTER_DRAWER_SUPPORT_TYPES.includes(type)) {
      this.setState({ drawerInfo: { category } });
    } else {
      this.props.filterActions.updateCategorySelectStatus({ id });
    }
  };

  handleClickResetAllCategoryButton = () => {
    this.props.resetSearchOptionList({ key: FILTER_BACKUP_STORAGE_KEYS.SEARCH });
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

    return (
      <Drawer
        className={styles.SearchPageCategoryDrawerHeaderWrapper}
        show={shouldShowDrawer}
        onClose={this.handleCloseDrawer}
        style={{ maxHeight: '99.8%' }}
      >
        <div className="tw-flex tw-flex-col tw-max-h-screen tw-overflow-hidden">
          <div className={styles.SearchPageCategoryDrawerHeaderContainer}>
            <Button
              type="text"
              onClick={this.handleCloseDrawer}
              className={`${styles.SearchPageCategoryDrawerHeaderButton} beep-text-reset`}
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
    const { searchInfo, shouldShowFilterBar, categoryFilterList, shouldShowResetButton } = this.props;
    const { keyword } = searchInfo;
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
              keyword={keyword}
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
      searchInfo: getSearchInfo(state),
      storeLinkInfo: getStoreLinkInfo(state),
      addressInfo: getAddressInfo(state),
      loadedSearchingStores: loadedSearchingStores(state),
      storePageInfo: getStorePageInfo(state),
      otherCollections: getOtherCollections(state),
      popularCollections: getPopupCollections(state),
      addressCoords: getAddressCoords(state),
      shouldShowCategories: getShouldShowCategories(state),
      shouldShowFilterBar: getShouldShowFilterBar(state),
      shouldShowStartSearchPage: getShouldShowStartSearchPage(state),
      shouldShowNoSearchResultPage: getShouldShowNoSearchResultPage(state),
      shouldShowStoreList: getShouldShowStoreList(state),
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
      searchActions: bindActionCreators(searchActions, dispatch),
      homeActions: bindActionCreators(homeActionCreators, dispatch),
      collectionCardActions: bindActionCreators(collectionCardActionCreators, dispatch),
      filterActions: bindActionCreators(filterActionCreators, dispatch),
    })
  )
)(SearchPage);
