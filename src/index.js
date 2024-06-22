require('dotenv').config();
const connectDB = require("./db/connection.js");
const port = process.env.PORT || 5000;
const app = require('./app.js');
connectDB()
    .then(() => {
        app.listen(port, () => console.log(`❄️  Server Running on http://localhost:${port}`));
    })
    .catch((error) => {
        console.log("🌋 Error Running the server ", error.message);
    })