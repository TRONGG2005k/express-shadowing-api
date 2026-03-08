const app = require('./src/app');

const PORT = process.env.PORT || 3000;
// console.log(`[Info] Starting server on port: ${PORT}...`);
app.listen(PORT, () => {
    console.log(`[Info] Server is running on port ${PORT}`);
});
