const config = {
  backendUrl: process.env.REACT_APP_BACKEND_URL,
  business: (d => d.length > 2 ? d.shift() : null)(window.location.hostname.split('.')),
  table: (m => m ? parseInt(m[1]) : null)(window.location.hash.match(/\btable\b=(\d+)/)),
};

export default config;
