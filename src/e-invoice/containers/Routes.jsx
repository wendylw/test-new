import React, { lazy, Suspense } from 'react';
import { Switch, Route, withRouter } from 'react-router-dom';
import { ConnectedRouter } from 'connected-react-router';
import { attemptLoad } from '../../common/utils';
import { PAGE_ROUTES } from '../utils/constants';
import history from '../utils/history';
import RoutesFallbackLoader from '../components/RoutesFallbackLoader';
import NotFound from '../../containers/NotFound';

const EInvoice = lazy(() => attemptLoad(() => import(/* webpackChunkName: "EINV" */ './EInvoice')));

const EInvoiceCategory = lazy(() => attemptLoad(() => import(/* webpackChunkName: "EINV_CAT" */ './EInvoiceCategory')));

const EInvoiceConsumerForm = lazy(() =>
  attemptLoad(() => import(/* webpackChunkName: "EINV_CUST_EDIT" */ './Consumer/containers/Form'))
);

const EInvoiceConsumerPreview = lazy(() =>
  attemptLoad(() => import(/* webpackChunkName: "EINV_CUST_PREV" */ './Consumer/containers/Preview'))
);

const EInvoiceBusinessForm = lazy(() =>
  attemptLoad(() => import(/* webpackChunkName: "EINV_BIZ_EDIT" */ './Business/containers/Form'))
);

const EInvoiceBusinessPreview = lazy(() =>
  attemptLoad(() => import(/* webpackChunkName: "EINV_BIZ_PREV" */ './Business/containers/Preview'))
);

const EInvoiceInvalid = lazy(() => attemptLoad(() => import(/* webpackChunkName: "EINV_INV" */ './Invalid')));

const Routes = () => (
  <ConnectedRouter history={history}>
    <Suspense fallback={<RoutesFallbackLoader />}>
      <Switch>
        <Route exact path={PAGE_ROUTES.E_INVOICE} component={EInvoice} />
        <Route exact path={PAGE_ROUTES.CATEGORY} component={EInvoiceCategory} />
        <Route exact path={PAGE_ROUTES.CONSUMER_FORM} component={EInvoiceConsumerForm} />
        <Route exact path={PAGE_ROUTES.CONSUMER_PREVIEW} component={EInvoiceConsumerPreview} />
        <Route exact path={PAGE_ROUTES.BUSINESS_FORM} component={EInvoiceBusinessForm} />
        <Route exact path={PAGE_ROUTES.BUSINESS_PREVIEW} component={EInvoiceBusinessPreview} />
        <Route exact path={PAGE_ROUTES.INVALID} component={EInvoiceInvalid} />
        <Route path="*" component={NotFound} />
      </Switch>
    </Suspense>
  </ConnectedRouter>
);

Routes.displayName = 'EInvoiceRoutes';

export default withRouter(Routes);
