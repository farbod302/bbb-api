const mongoose = require("mongoose")


const school = ({
    classes: Array,
    bbb_url: String,
    bbb_token: String,
    schoolName: String,
    Date:Date
})


module.exports = mongoose.model("School", school)
