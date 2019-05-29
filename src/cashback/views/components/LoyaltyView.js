import React from 'react';
import InfiniteScroll from 'react-infinite-scroller';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { setUserInfo } from '../../actions';
import RecentActivityView from './RecentActivityView';
import CurrencyNumber from './CurrencyNumber';

class LoyaltyView extends React.Component {
  state = {
    fullScreen: false,
  }

  toggleFullScreen() {
    this.setState({ fullScreen: !this.state.fullScreen });
  }

  render() {
    return (
      <section className={`asdie-section ${this.state.fullScreen ? 'full' : ''}`}>
        <aside className="aside-bottom">
          {
            !this.state.fullScreen ? (
              <i className="aside-bottom__slide-button" onClick={this.toggleFullScreen.bind(this)}></i>
            ) : (
              <header className="header border__bottom-divider flex flex-middle flex-space-between">
                <figure
                  className="header__image-container text-middle"
                  onClick={this.toggleFullScreen.bind(this)}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                    <path d="M0 0h24v24H0z" fill="none"/>
                  </svg>
                </figure>
              </header>
            )
          }
          <h3 className="aside-bottom__title text-center" onClick={this.toggleFullScreen.bind(this)}>Recent Activity</h3>
          <RecentActivityView fullScreen={this.state.fullScreen} />
        </aside>
      </section>
    );
  }
}

const mapStateToProps = () => ({ });

const mapDispathToProps = dispatch => bindActionCreators({
  setUserInfo, // TODO: change to query loyalty list
}, dispatch);

export default connect(mapStateToProps, mapDispathToProps)(LoyaltyView);