import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import './App.scss';
import { compose, Query } from 'react-apollo';
import Routes from './Routes';
import config from './config';
import Constants from './Constants';
import withResizeWindowBlocker from './libs/withResizeWindowBlocker';
import apiGql from './apiGql';

class App extends Component {
  state = {
    sessionReady: false,
  };

  async componentDidMount() {
    await fetch(`${config.backendBaseUrl}${Constants.BACKEND_PING_PATH}`);
    this.setState({ sessionReady: true });
  }

  tryPeopleCount(response) {
    const { history } = this.props;
    const { onlineStoreInfo } = response;

    // TODO: remove this default value when API dev is completed.
    const { isPeopleCountRequired = true } = onlineStoreInfo;

    if (isPeopleCountRequired && !config.peopleCount) {
      if (history.location.pathname.indexOf('/modal/people-count') === -1) {
        const peopleCountModalPath = `${history.location.pathname}/modal/people-count`;
        history.push(peopleCountModalPath);
      }
    }
  }

  renderError(error) {

    return null;
  }

  render() {
    

    return (
      <Query
        query={apiGql.GET_ONLINE_STORE_INFO}
        variables={{ business: config.business }}
        onCompleted={this.tryPeopleCount.bind(this)}
      >
        {({ error }) => {
          if (error) {
            console.error(error);
            return (
              <div>Fail to get store info, refresh page after 30 seconds.</div>
            );
          }

          return (
            <main className="table-ordering">
              {this.state.sessionReady ? <Routes /> : null}
            </main>
          )
        }}
      </Query>
    );
  }
}

export default compose(
  withResizeWindowBlocker,
  withRouter,
)(App);
