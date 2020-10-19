import React, { Component } from 'react';
import { withTranslation } from 'react-i18next';
import { withRouter } from 'react-router-dom';
import InfiniteScroll from 'react-infinite-scroller';
import './EmptySearch.scss';

class EmptySearch extends Component {
  handleClick = urlPath => () => {
    const { history } = this.props;
    history.push({ pathname: `/collections/${urlPath}`, state: { from: '/search' } });
  };

  renderPopularCategories() {
    const { t, populars } = this.props;
    return (
      <div className="search-popular padding-top-bottom-normal">
        <h2 className={'padding-top-bottom-normal text-weight-bolder'}>{t('PopularCategories')}</h2>
        <div className={'search-popular__container flex flex-between'}>
          {(populars || []).map(collection => {
            const { name, urlPath } = collection || {};

            return (
              <span
                key={urlPath}
                className="search-popular__category padding-small"
                onClick={this.handleClick(urlPath)}
                data-heap-name="site.search.popular-categories"
              >
                {name}
              </span>
            );
          })}
        </div>
      </div>
    );
  }

  renderOtherItems = () => {
    const { others } = this.props;

    return (
      <div>
        {(others || []).map(collection => {
          const { name, urlPath } = collection || {};

          return (
            <li
              key={urlPath}
              className="search-other__category padding-top-bottom-normal"
              onClick={this.handleClick(urlPath)}
              data-heap-name="site.search.other-categories"
            >
              <span className="search-other__name">{name}</span>
            </li>
          );
        })}
      </div>
    );
  };

  renderOtherCategories() {
    const { t, hasMore, getScrollParent, loadCollections, others } = this.props;

    return (
      <div className={'search-other'}>
        <h2 className={'padding-top-bottom-normal text-weight-bolder'}>{t('OtherCategories')}</h2>
        <ul className={'search-other__container'}>
          {!others || !others.length ? null : (
            <InfiniteScroll
              className="store-card-list"
              element="ul"
              loader={<div key={'loading-0'} className="store-card-list__loader loader theme text-size-biggest" />}
              pageStart={0}
              initialLoad={false}
              hasMore={hasMore}
              loadMore={page => loadCollections(page)}
              getScrollParent={getScrollParent}
              useWindow={false}
            >
              {this.renderOtherItems()}
            </InfiniteScroll>
          )}
        </ul>
      </div>
    );
  }

  render() {
    const { populars, others } = this.props;
    return (
      <div className={'empty-search padding-normal'}>
        {populars && populars.length > 0 && this.renderPopularCategories()}
        {others && others.length > 0 && this.renderOtherCategories()}
      </div>
    );
  }
}

export default withRouter(withTranslation('SiteHome')(EmptySearch));
