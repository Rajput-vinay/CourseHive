const express = require('express');
const dotenv = require('dotenv');
const { dbConnect } = require('./db/db');
const { adminRouter } = require('./routes/adminRoutes');
const { userRouter } = require('./routes/userRoutes');
const cookieParser = require("cookie-parser")
dotenv.config(); // Load environment variables

const app = express();
app.use(express.json());
app.use(cookieParser())

// Connect to MongoDB
dbConnect();

// Define routes
app.use('/admin', adminRouter);
app.use('/users', userRouter);

// Start the server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
});
