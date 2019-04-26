import React from 'react';
import { HashRouter as Router } from "react-router-dom";
import ReactDOM from 'react-dom';
import { ApolloProvider } from "react-apollo";
import './config'; // import here for globally init
import apiClient from './apiClient';
import './index.css';
import App from './App.1';
import * as serviceWorker from './serviceWorker';

ReactDOM.render(
  <ApolloProvider client={apiClient}>
    <Router>
      <App />
    </Router>
  </ApolloProvider>,
  document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.register();
