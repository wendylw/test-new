import React from 'react';
import ReactDOM from 'react-dom';
import { ApolloProvider } from "react-apollo";
import { client as apiClient } from './apiClient';
import * as serviceWorker from './serviceWorker';
import './config'; // import here for globally init

import Bootstrap from './Bootstrap';
import HeapJS from './views/components/HeapJS';

import './index.css';

ReactDOM.render(
  <HeapJS>
    <ApolloProvider client={apiClient}>
      <Bootstrap />
    </ApolloProvider>
  </HeapJS>,
  document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
