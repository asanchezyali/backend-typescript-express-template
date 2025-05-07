import app from '#app.js';
import config from '#config.js';

const PORT = config.port;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Configuration: model=${config.model}, maxConcurrency=${config.maxConcurrency}`);
  console.log('API documentation available at /api-docs');
});
