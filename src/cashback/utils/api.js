import axios from './axios';

const api = async (...args) => {
  try {
    const { data } = await axios(...args);

    return data;
  } catch (e) {
    console.log('api(%o) => Error', args);

    // TODO: can globally process error here.
    if (e.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error(e.response.data);
      console.error(e.response.status);
      console.error(e.response.headers);
    } else if (e.request) {
      // The request was made but no response was received
      // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
      // http.ClientRequest in node.js
      console.error(e.request);
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('Error', e.message);
    }
    console.error(e.config);
    throw e;
  }
};

export const apiCredential = axios.create({ withCredentials: true })

export default api;
