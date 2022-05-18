import React from 'react';
import { bindActionCreators, compose } from 'redux';
import { connect } from 'react-redux';
import { withTranslation, Trans } from 'react-i18next';
import _debounce from 'lodash/debounce';
import { CaretLeft } from 'phosphor-react';
import _get from 'lodash/get';
import SearchBox from '../components/SearchBox';
import StoreListAutoScroll from '../components/StoreListAutoScroll';
import StoreList from '../components/StoreList';
import EmptySearch from './components/EmptySearch';
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
import { isSameAddressCoords, scrollTopPosition } from '../utils';
import constants from '../../utils/constants';
import CleverTap from '../../utils/clevertap';
import styles from './SearchPage.module.scss';

const { COLLECTIONS_TYPE } = constants;

class SearchPage extends React.Component {
  renderId = `${Date.now()}`;
  scrollTop = 0;
  sectionRef = React.createRef();

  componentDidMount = async () => {
    const { otherCollections, popularCollections, fetchAddressInfo } = this.props;
    if (!checkStateRestoreStatus()) {
      this.resetSearchData();
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
    const { addressCoords: prevAddressCoords } = prevProps;
    const { addressCoords: currAddressCoords, collectionCardActions } = this.props;

    if (!isSameAddressCoords(prevAddressCoords, currAddressCoords)) {
      scrollTopPosition(this.sectionRef.current);
      this.resetSearchData();
      // Reload other and popular collections once address changed
      collectionCardActions.getCollections(COLLECTIONS_TYPE.OTHERS);
      collectionCardActions.getCollections(COLLECTIONS_TYPE.POPULAR);
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

  render() {
    const { searchInfo, shouldShowFilterBar } = this.props;
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
        </div>
        <section ref={this.sectionRef} className="entry-home fixed-wrapper__container wrapper">
          {this.renderStoreList()}
        </section>
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
    }),
    dispatch => ({
      fetchAddressInfo: bindActionCreators(fetchAddressInfo, dispatch),
      rootActions: bindActionCreators(rootActionCreators, dispatch),
      appActions: bindActionCreators(appActionCreators, dispatch),
      searchActions: bindActionCreators(searchActions, dispatch),
      homeActions: bindActionCreators(homeActionCreators, dispatch),
      collectionCardActions: bindActionCreators(collectionCardActionCreators, dispatch),
    })
  )
)(SearchPage);
