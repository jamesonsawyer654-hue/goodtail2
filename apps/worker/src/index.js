// Good Tail Co. Worker entry: /api/* goes to the API, everything else is the static storefront.
import { handleApi } from './api.js';

export default {
  async fetch(request, env) {
    const { pathname } = new URL(request.url);
    if (pathname.startsWith('/api/')) return handleApi(request, env);
    return env.ASSETS.fetch(request);
  },
};
