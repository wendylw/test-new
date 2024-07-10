import { isEInvoiceDomain } from '../index';

describe('isEInvoiceDomain', () => {
  const originalLocation = window.location;

  beforeEach(() => {
    delete window.location;
    window.location = { hostname: 'e-invoice.storehub.com' };
  });

  afterEach(() => {
    delete process.env.REACT_APP_EINVOICE_DOMAIN;
    window.location = originalLocation;
  });

  it('should return true if the current domain is in the list of domains', () => {
    process.env.REACT_APP_EINVOICE_DOMAIN = 'e-invoice.beepit.com,e-invoice.storehub.com,e-invoice.beep.local.shub.us,';
    expect(isEInvoiceDomain()).toBe(true);
  });

  it('should return false if the current domain is not in the list of domains', () => {
    process.env.REACT_APP_EINVOICE_DOMAIN = 'foo.com, bar.com';
    expect(isEInvoiceDomain()).toBe(false);
  });

  it('should return false if the list of domains is empty', () => {
    process.env.REACT_APP_EINVOICE_DOMAIN = '';
    expect(isEInvoiceDomain()).toBe(false);
  });

  it('should use the provided domain if one is given', () => {
    process.env.REACT_APP_EINVOICE_DOMAIN = 'e-invoice.storehub.com';
    expect(isEInvoiceDomain('e-invoice.storehub.com')).toBe(true);
    expect(isEInvoiceDomain('foo.com')).toBe(false);
  });

  it('should ignore leading/trailing whitespace in the list of domains', () => {
    process.env.REACT_APP_EINVOICE_DOMAIN = '  e-invoice.storehub.com ,  foo.com  ';
    expect(isEInvoiceDomain('e-invoice.storehub.com')).toBe(true);
    expect(isEInvoiceDomain('foo.com')).toBe(true);
    expect(isEInvoiceDomain('bar.com')).toBe(false);
  });

  it('should ignore case when comparing domains', () => {
    process.env.REACT_APP_EINVOICE_DOMAIN = 'E-INVOICE.STOREHUB.COM, foo.com';
    expect(isEInvoiceDomain('e-invoice.storehub.com')).toBe(true);
    expect(isEInvoiceDomain('Foo.com')).toBe(true);
    expect(isEInvoiceDomain('bar.com')).toBe(false);
  });
});
