import { PATHS } from './constants';

export const isEInvoicePathname = (pathname = window.location.pathname) => pathname.startsWith(PATHS.E_INVOICE);
