import updatedFetch from './fetch';
import { mockFetch, setRealFetch, shouldEnableMockApi } from '../utils/mockApi';

if (shouldEnableMockApi) {
  setRealFetch(updatedFetch);
  // @ts-ignore
  global.fetch = mockFetch;
} else {
  // @ts-ignore
  global.fetch = updatedFetch;
}
