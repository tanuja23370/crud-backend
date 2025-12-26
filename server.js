const express = require("express");
const cors = require("cors");
require("dotenv").config();

const path = require("path");

const swaggerUI = require("swagger-ui-express");
const swaggerSpec = require("./swagger");

const userRoutes = require("./routes/userRoutes");

const connectDB = require("./config/db");

const app = express();


// Middleware
app.use(cors());
app.use(express.json());

//routes
app.use("/api/users", userRoutes);

//swagger
app.use("/api-docs", swaggerUI.serve, swaggerUI.setup(swaggerSpec));

//multer
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Serve static frontend files
app.use(express.static(path.join(__dirname, "public")));

// Connect to MongoDB
connectDB();

// Default route (homepage)
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
