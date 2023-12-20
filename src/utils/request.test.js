import fetch from 'jest-fetch-mock';
import { get, post, put } from './request';

describe('utils/request', () => {
  let originalFetch;
  beforeAll(() => {
    originalFetch = global.fetch;
    global.fetch = fetch;
  });
  afterAll(() => {
    global.fetch = originalFetch;
  });
  afterEach(() => {
    fetch.resetMocks();
  });

  it('get: should be able to get data with correct settings', async () => {
    fetch.mockResponseOnce(JSON.stringify({ greeting: 'hello' }));
    const response = await get('/url');
    expect(fetch.mock.calls[0][0]).toBe('/url');
    expect(fetch.mock.calls[0][1].method).toBe('GET');
    expect(fetch.mock.calls[0][1].credentials).toBe('include');
    expect(fetch.mock.calls[0][1].headers.get('Accept')).toBe('application/json');
    expect(fetch.mock.calls[0][1].headers.get('Content-Type')).toBe('application/json');
    expect(response).toEqual({ greeting: 'hello' });
  });

  it('get: should reject when encountered errors', async () => {
    fetch.mockRejectOnce(new Error('Not Permitted'));
    let error;
    try {
      await get('/url');
    } catch (e) {
      error = e;
    }
    expect(error.toString()).toContain('Not Permitted');
  });

  it('post: should be able to get data with correct settings', async () => {
    const req = { company: 'storehub' };
    const res = { greeting: 'hello' };
    fetch.mockResponseOnce(JSON.stringify(res));
    const response = await post('/url', req);
    expect(fetch.mock.calls[0][0]).toBe('/url');
    expect(fetch.mock.calls[0][1].method).toBe('POST');
    expect(fetch.mock.calls[0][1].credentials).toBe('include');
    expect(fetch.mock.calls[0][1].headers.get('Accept')).toBe('application/json');
    expect(fetch.mock.calls[0][1].headers.get('Content-Type')).toBe('application/json');
    expect(fetch.mock.calls[0][1].body).toBe(JSON.stringify(req));
    expect(response).toEqual(res);
  });

  it('post: should reject when encountered errors', async () => {
    const req = { company: 'storehub' };
    fetch.mockRejectOnce(new Error('Internal Error'));
    let error;
    try {
      await post('/url', req);
    } catch (e) {
      error = e;
    }
    expect(error.toString()).toContain('Internal Error');
  });

  it('put: should be able to get data with correct settings', async () => {
    const req = { company: 'storehub' };
    const res = { greeting: 'hello' };
    fetch.mockResponseOnce(JSON.stringify(res));
    const response = await put('/url', req);
    expect(fetch.mock.calls[0][0]).toBe('/url');
    expect(fetch.mock.calls[0][1].method).toBe('PUT');
    expect(fetch.mock.calls[0][1].credentials).toBe('include');
    expect(fetch.mock.calls[0][1].headers.get('Accept')).toBe('application/json');
    expect(fetch.mock.calls[0][1].headers.get('Content-Type')).toBe('application/json');
    expect(fetch.mock.calls[0][1].body).toBe(JSON.stringify(req));
    expect(response).toEqual(res);
  });

  it('put: should reject when encountered errors', async () => {
    const req = { company: 'storehub' };
    fetch.mockRejectOnce(new Error('Internal Error'));
    let error;
    try {
      await put('/url', req);
    } catch (e) {
      error = e;
    }
    expect(error.toString()).toContain('Internal Error');
  });
});
