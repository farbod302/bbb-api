// سلام و وقت بخیر
// ای پی آی در سرور دیگری آنلاین شده و نیازی به ویرایش کد های ای پی آی  سایت نیست
// فقط آدرس درخواست درداخل کد های سایت باید تغییر کند و اطلاعات با متد پوست به سرور ارسال شود
//برای مثال آدرس درخواست ایجاد کلاس در سایت داران الان با این آدرس است
//http://daaraan.ir/metting/create
//این آدرس داخل سایت باید با آدرس زیر جایگزین شود و متد ارسال آن از گت به پست تغییر کند
//http://daaraanserver.erfanschoolabhar.ir/bbb/create
// اطلاعات کامل برای هر درخواست در قسمت کد مربوط نوشته شده است





const express = require("express");
const router = express.Router();
const School = require("../db/classes")
require('dotenv').config()



const bbb = require('bigbluebutton-js'); //کتابخانه بیگ بلو باتن

const { http } = require("bigbluebutton-js");






// دریافت و ثبت اطلاعات سرور و کلاس های مربوط به آن در دیتابیس
// این بخش ربطی به ای پی ای ندارد  و برای دسته بندی کلاس ها است
router.post("/add", (req, res) => {

    const { classes, bbb_url, bbb_token, schoolName } = req.body
    const school = new School({
        classes, bbb_url, bbb_token, schoolName,
        Date: new Date().toISOString()
    })

    school.save().then(ress => {
        res.json(ress)
    })

})

//ایجاد کلاس

//اطلاعات (پیلود) لازم برای ایجاد کلاس که از سمت سایت باید ارسال شود فقط کد کلاس است و به پسوند کلاس روم نیاز نیست
//اطلاعات با متد پست ارسال شود و با فرمت جیسان.نوع داده میتواند نامبر یا استرینگ باشد

//مثال
// {
//     "className":"1"
// }

//یا

// {
//     "className":1
// }



//آدرس درخواست ایجاد کلاس

//http://daaraanserver.erfanschoolabhar.ir/bbb/create

router.post("/create", (req, res) => {

    const { className } = req.body //دریافت کد کلاس از سمت سایت



    //شروع تابع ایجاد کلاس 

    //  ایجاد شده با کتابخانه های خود بیگ بلو باتن

    createClass = (url, token) => { //دریافت آدرس و توکن  به صورت متغییر
        const api = bbb.api(

            url,
            token
        )

        //آپشن ها و هش سازی
        let meetingCreateUrl = api.administration.create( //خود کتابخانه عملیات هش سازی را انجام میدهد و آدرس را تولید میکند
            `ClassRoom${className}`,//آی دی کلاس
            `ClassRoom${className}`,// اسم کلاس
            { //آپشن ها
                attendeePW: 'ap',
                moderatorPW: "mp",
                logoutURL: "www.daaraan.ir"
            })
        //ارسال درخواست ایجاد کلاس
        bbb.http(meetingCreateUrl).then((result) => {
            return res.json(true) //پیام موفقیت ایجاد کلاس.میتواند بعدا فارسی شود

        })



    }
    //پایان تابع ایجاد کلاس 



    //استخراج شماره کلاس از دیتابیس و تشخیص سرور مربوط به کلاس
    School.findOne({ classes: Number(className) })
        .then(result => {
            if (result) { //در صورت موجود بودن شماره کلاس در دیتابیس سرور مربوطه به آن کلاس انتخاب میشود
                console.log(result);

                createClass(result.bbb_url, result.bbb_token);//فراخوانی تابع ایجاد کلاس
            }

            else { //در غیر این  صورت کلاس مربوط اگر در دیتابیس تعریف شده نبود بر روی سرور عمومی برگزار میشود
                createClass(process.env.BBB_MAIN_URL, process.env.BBB_MAIN_TOKEN);
            }
        })


})
//روال بقیه درخواست ها از قبیل ورود مدرس,ورود دانش آموز و اتمام کلاس نیز به همین صورت است

//پیلود مورد نیاز برای ورود فراگیران به کلاس نام آنها و کد کلاس است

//فایل ها با فرمت جی سان ارسال شود
//مثال
// {
//     username:"فربد علی اکبری",
//     className:1
// }


//ورود دانش آموز به کلاس

// آدرس درخواست ورود به کلاس دانش آموزان

//http://daaraanserver.erfanschoolabhar.ir/bbb/joina
router.post("/joina", (req, res) => {

    const { className, username } = JSON.parse(Object.keys(req.body)[0])

    joina = (url, token) => {
        const api = bbb.api(
            url,
            token
        )
        let runningORnot = api.monitoring.getMeetingInfo(`ClassRoom${className}`)
        bbb.http(runningORnot).then((result) => {
            if (result.returncode === "SUCCESS") {

                let attendeeUrl = api.administration.join(username, `ClassRoom${className}`, "ap")  //رمز فراگیر
                return res.json({
                    result: true,
                    url: attendeeUrl
                })

            }
            else {
                res.json(`کلاس ${className} به اتمام رسیده`)
            }
        })
    }

    School.findOne({ classes: Number(className) })
        .then(result => {

            if (result) {
                joina(result.bbb_url, result.bbb_token)
            }
            else {
                joina(process.env.BBB_MAIN_URL, process.env.BBB_MAIN_TOKEN)
            }

        })


})

//عضویت مدرس به کلاس

//پیلود مورد نیاز برای عضویت مدرسین نام آنها و کد کلاس است
//تنها فرق این درخواست در آدرس ارسال درخواست است

//مثال

// {
//     username:"فربد علی اکبری",
//     className:1
// }


// آدرس درخواست ورود به کلاس مدرسین

//http://daaraanserver.erfanschoolabhar.ir/bbb/joinm

router.post("/joinm", (req, res) => {

    const { className, username } = JSON.parse(Object.keys(req.body)[0])



    joinm = (url, token) => {
        const api = bbb.api(
            url,
            token
        )
        let runningORnot = api.monitoring.getMeetingInfo(`ClassRoom${className}`)
        bbb.http(runningORnot).then((result) => {
            if (result.returncode === "SUCCESS") {

                let attendeeUrl = api.administration.join(username, `ClassRoom${className}`, "mp") //رمز مدرس
                return res.json({
                    result: true,
                    url: attendeeUrl
                })

            }
            else {
                res.json(`کلاس ${className} به اتمام رسیده`)
            }
        })
    }

    School.findOne({ classes: Number(className) })
        .then(result => {

            if (result) {
                joinm(result.bbb_url, result.bbb_token)
            }
            else {
                joinm(process.env.BBB_MAIN_URL, process.env.BBB_MAIN_TOKEN)
            }

        })

})

// اتمام کلاس
//پیلود مورد نیاز برای اتمام کلاس کد کلاس است


// آدرس درخواست اتمام کلاس

//http://daaraanserver.erfanschoolabhar.ir/bbb/end

router.post("/end", (req, res) => {

    const { className } = req.body

    end = (url, token) => {
        const api = bbb.api(
            url,
            token
        )

        let runningORnot = api.monitoring.getMeetingInfo(`ClassRoom${className}`)

        bbb.http(runningORnot).then((result => {
            if (result.returncode == "SUCCESS") {

                let meetingEndUrl = api.administration.end(`ClassRoom${className}`, "mp")

                bbb.http(meetingEndUrl).then((result) => {

                    res.json("SUCCESS")


                })
            }

            else {
                res.json("کلاس قبلا پایان یافته بود")
            }


        }))
    }
    School.findOne({ classes: Number(className) })
        .then(result => {
            if (result) {
                end(result.bbb_url, result.bbb_token)
            }
            else {
                end(process.env.BBB_MAIN_URL, process.env.BBB_MAIN_TOKEN)
            }
        })






})





module.exports = router
