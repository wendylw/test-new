import axios from 'axios';

axios.defaults.withCredentials = true

if (process.env.NODE_ENV !== 'production') {
  window.axios = axios;
}

export default axios;
