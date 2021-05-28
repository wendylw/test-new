const businessName = (d => (d.length > 2 ? d.shift() : null))(window.location.hostname.split('.'));
export default businessName;
