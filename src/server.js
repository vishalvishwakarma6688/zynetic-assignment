const app = require('./app');
const pool = require('./config/database');

const PORT = process.env.PORT || 3000;

let server;

const startServer = async () => {
    try {
        await pool.query('SELECT NOW()');
        console.log('Database connection successful');

        server = app.listen(PORT, () => {
            console.log(`Energy Ingestion Engine running on port ${PORT}`);
            console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
            console.log(`Health check: http://localhost:${PORT}/health`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};

const gracefulShutdown = async (signal) => {
    console.log(`\n${signal} received. Starting graceful shutdown...`);

    if (server) {
        server.close(async () => {
            console.log('HTTP server closed');

            try {
                await pool.end();
                console.log('Database connections closed');
                process.exit(0);
            } catch (error) {
                console.error('Error during shutdown:', error);
                process.exit(1);
            }
        });
    }
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

startServer();
