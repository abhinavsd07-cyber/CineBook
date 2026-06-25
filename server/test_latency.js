const http = require('http');

async function measureLatency() {
  const apis = [
    '/api/movies/now-showing',
    '/api/movies/upcoming',
    '/api/movies/premieres',
    '/api/movies/events',
    '/api/movies/banners' // wait, getBanners hits what endpoint?
  ];
  
  for (const api of apis) {
    const start = Date.now();
    try {
      const res = await fetch(`http://localhost:5000${api}`);
      await res.json();
      console.log(`${api}: ${Date.now() - start}ms`);
    } catch (e) {
      console.log(`${api}: ERROR`);
    }
  }
}
measureLatency();
