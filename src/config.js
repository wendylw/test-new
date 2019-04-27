const config = {
  // backendUrl: 'http://localhost:5000/graphql',
  backendUrl: 'http://localhost:4000/graphql',
  // backendUrl: 'http://localhost:9002/graphql',
  business: (d => d.length > 2 ? d.shift() : null)(window.location.hostname.split('.')),
  table: (m => m ? parseInt(m[1]) : null)(window.location.search.match(/\btable\b=(\d+)/)),
  sessionId: 'nVr1wT1kmSN797T-ZGQizaK4K0RRYGfe',
};

export default config;
