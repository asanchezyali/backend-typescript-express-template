import app from './app.js';
import config from './config.js';

const PORT = config.port;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT.toString()}`);
  console.log(`Configuration: model=${config.model}, maxConcurrency=${config.maxConcurrency.toString()}`);
  console.log('API documentation available at /api-docs');
});
