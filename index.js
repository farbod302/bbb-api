const express = require("express")
const mongoose=require("mongoose")
require('dotenv').config()


const cors = require("cors")


const bbbRouter = require('./routs/bbb')

const app = express()
app.use(express.json())
var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(cors())


app.listen(5000, console.log(`connected`))
mongoose.connect(process.env.DB, {
    useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false, useCreateIndex: true,
},(err)=>{
    if(err)console.log(err);
    console.log("ok");
})




app.use("/bbb", bbbRouter)
