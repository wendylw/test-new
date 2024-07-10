export const isEInvoiceDomain = (domain = window.location.hostname) => {
  const domainList = (process.env.REACT_APP_EINVOICE_DOMAIN || '')
    .split(',')
    .map(d => d.trim())
    .filter(d => d);

  return domainList.some(d => domain.toLowerCase() === d.toLowerCase());
};
