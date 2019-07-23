import { graphql, compose } from 'react-apollo';
import apiGql from '../apiGql';

export default () => compose(
	graphql(apiGql.GET_BRAINTREE_TOKEN, {
		name: 'gqlBraintreeToken'
	}),
);
