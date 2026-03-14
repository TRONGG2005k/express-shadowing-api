// Fix BigInt serialization issue for JSON.stringify
BigInt.prototype.toJSON = function () {
    return this.toString();
};

const app = require('./src/app');
require('dotenv').config();
const PORT = process.env.PORT || 3000;
// console.log(`[Info] Starting server on port: ${PORT}...`);
app.listen(PORT, () => {
    console.log(`[Info] Server is running on port ${PORT}`);
});
