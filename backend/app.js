const express = require("express")
const dotenv = require("dotenv")
const path = require("path")
const logger = require("morgan")
const cors = require("cors")

// Config .env file
dotenv.config()

// Initialize express app
const app = express()

// Middleware
app.use(cors())
app.use(logger("dev"))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Router index
const indexRouter = require("./routes/index")
app.use("/", indexRouter)

// Health check
app.get("/", (req, res) => {
  res.status(200).send("Health Check")
})

// Iniciar el servidor
const PORT = process.env.PORT || 5000
const ENV = "DEV"

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT} using ${ENV} env.`)
})
