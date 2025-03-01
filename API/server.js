const app = require('./app');
const logger = require('./config/logger');

const { initDB } = require('./config/db');
const PORT = process.env.PORT || 3000;

// Initialize the database
initDB();
app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});
