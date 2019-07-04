import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router } from "react-router-dom";
import { ApolloProvider } from "react-apollo";
import './config'; // import here for globally init
import { client as apiClient } from './apiClient';
import './index.css';
import Bootstrap from './Bootstrap';
import * as serviceWorker from './serviceWorker';
import HeapJS from './views/components/HeapJS';

ReactDOM.render(
  <HeapJS>
    <ApolloProvider client={apiClient}>
      <Router>
        <Bootstrap />
      </Router>
    </ApolloProvider>
  </HeapJS>,
  document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
