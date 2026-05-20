const logger = {
    info: (msg, details = {}) => {
        const timestamp = new Date().toISOString();
        console.log(`[INFO] ${timestamp}: ${msg}`, Object.keys(details).length ? details : '');
    },
    warn: (msg, details = {}) => {
        const timestamp = new Date().toISOString();
        console.warn(`[WARN] ${timestamp}: ${msg}`, Object.keys(details).length ? details : '');
    },
    error: (msg, details = {}) => {
        const timestamp = new Date().toISOString();
        console.error(`[ERROR] ${timestamp}: ${msg}`, Object.keys(details).length ? details : '');
    },
    dbLog: async (data) => {
        try {
            const Log = (await import('../models/Log.js')).default;
            await Log.create(data);
        } catch (error) {
            console.error('Failed to save log to DB:', error.message);
        }
    }
};

export default logger;
