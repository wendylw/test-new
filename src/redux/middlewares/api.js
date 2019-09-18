import { get, post } from '../../utils/request';

//Deal with every single action that has API_REQUEST field.
export const API_REQUEST = 'API REQUEST';

export default store => next => action => {
	const callAPI = action[API_REQUEST];

	if (!callAPI) {
		return next(action);
	}

	console.log(callAPI);

	const {
		url,
		method,
		types,
		params,
		payload
	} = callAPI;
	const requestParamsStr = params ? '?' + Object.keys(params).map(key => `${key}=${params[key]}`).join('&') : '';
	const requestUrl = `${url}${requestParamsStr}`;

	if (typeof url !== 'string') {
		throw new Error('url is required as string');
	}
	if (!Array.isArray(types) && types.length !== 3) {
		throw new Error('types is required as actions');
	}
	if (!types.every(type => typeof type === 'string')) {
		throw new Error('every type in types should be string');
	}

	const actionWith = responseData => {
		const finalAction = { ...action, ...responseData };

		delete finalAction[API_REQUEST];
		return finalAction;
	}

	const [requestType, successType, failureType] = types;

	next(actionWith({ type: requestType }));

	const methodMapToRequest = {
		get: (url) => get(url),
		post: (url, payload) => post(url, payload),
	};

	return methodMapToRequest[method](requestUrl, payload).then(
		response => {
			const { error } = response;

			// handle error filed when 200 status
			if (error) {
				return next(actionWith({
					type: failureType,
					...error,
				}));
			}

			return next(actionWith({
				type: successType,
				response
			}));
		},
	).catch(error => {
		return next(actionWith({
			type: failureType,
			...error,
		}));
	});
}