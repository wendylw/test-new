import React, { lazy, Suspense } from 'react';
import { Switch, Route, withRouter } from 'react-router-dom';
import { ConnectedRouter } from 'connected-react-router';
import { attemptLoad } from '../../common/utils';
import { PAGE_ROUTES } from '../utils/constants';
import history from '../utils/history';
import Loader from '../../common/components/Loader';
import NotFound from '../../containers/NotFound';

const EInvoice = lazy(() => attemptLoad(() => import(/* webpackChunkName: "EINV" */ './EInvoice')));

const EInvoiceCategory = lazy(() => attemptLoad(() => import(/* webpackChunkName: "EINV_CAT" */ './EInvoiceCategory')));

const EInvoiceInvalid = lazy(() => attemptLoad(() => import(/* webpackChunkName: "EINV_INV" */ './Invalid')));

const Routes = () => (
  <ConnectedRouter history={history}>
    <Suspense fallback={<Loader />}>
      <Switch>
        <Route exact path={PAGE_ROUTES.E_INVOICE} component={EInvoice} />
        <Route exact path={PAGE_ROUTES.CATEGORY} component={EInvoiceCategory} />
        <Route exact path={PAGE_ROUTES.INVALID} component={EInvoiceInvalid} />
        <Route path="*" component={NotFound} />
      </Switch>
    </Suspense>
  </ConnectedRouter>
);

Routes.displayName = 'EInvoiceRoutes';

export default withRouter(Routes);
