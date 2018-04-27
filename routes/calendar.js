const express = require('express');
const router = express.Router();
const calender = require('../model/calendar').calendar;
const session = require("../model/session").session;
const ensureAuthenticated = require("../helpers/certification").ensureAuthenticated;



/* GET users listing. */
router.get('/', function(req, res, next) {
    res.send('respond with a resource');
});

router.get("/register", ensureAuthenticated, function(req, res){
    res.render("cal_register");
});

router.post("/", function(req, res){

    const body = req.body;
    const resource = getResource(body);
    const calendarId =  session["calendarId"];
    const auth = session[req.session.id];

    calender.insert(auth, calendarId, resource, function(err, result){
        if(err) {
            res.json("Error : " + err.message);
            return;
        }
        res.redirect("/calendar/register");
        //res.json(result.data)
    });

});

router.get("/search", ensureAuthenticated, function(req, res){
    res.render("cal_search");
});

router.get("/search/list", function(req, res){

    const auth = session[req.session.id];
    const calendarId =  session["calendarId"];

    if(req.query.startDate == "" && req.query.endDate == "") {
        calender.eventList(auth, calendarId, function(err, result){
            if(err) {
                res.json("Error : " + err.message);
                return;
            }

            res.json(result);
        });
    } else {
        const startDate = new Date(req.query.startDate);
        const endDate = new Date(req.query.endDate);

        endDate.setHours(endDate.getHours() + 14);
        endDate.setMinutes(endDate.getMinutes() + 59);
        endDate.setSeconds(endDate.getSeconds() +59);

        console.log(startDate + " : " + endDate);

        calender.rangeEventList(auth, calendarId, startDate, endDate, function(err, result){
            if(err) {
                res.json("Error : " + err.message);
                return;
            }

            res.json(result);
        });
    }

});

router.post("/update",  function(req, res){

    const result = JSON.parse(req.body.result);
    const resource = getResource(result);
    const auth = session[req.session.id];
    const uid = result.calendarId;
    const calendarId =  session["calendarId"];

    calender.update(auth, calendarId, uid, resource, function(err, result){
        if(err) {
            res.json("Error : " + err.message);
            return;
        }
        res.json("success")
    })

});

router.post("/delete", function(req, res){

    //console.log(req.body.sds);

    const auth = session[req.session.id];
    const uid = req.body.uid;
    const calendarId =  session["calendarId"];

    calender.delete(auth, calendarId, uid, function(err, result){

        if(err) {
            res.json("Error : " +err.message);
        } else {
            res.json("success");
        }

    });

});

router.post("/print", function(req, res){

    //console.log(JSON.parse(req.body.printData));

    res.render("calendar_print", {
        printList: JSON.stringify(req.body.printData)
    });

});



router.get("/select", ensureAuthenticated, function(req, res){
   res.render("cal_select");
});

router.get("/list", function(req, res){

    const auth = session[req.session.id];

    calender.calendarList(auth, function(err, result){

        if(err) {
            res.json("error");
            return;
        }

        res.json(result);

    });

});

router.post("/list", function(req, res){

    session["calendarId"] = req.body.calendarList;
    res.redirect("/calendar/register");

});

router.post("/excel", function(req, res){

    //console.log(req.body.printData);

    // Require library
    var xl = require('excel4node');

    // Create a new instance of a Workbook class
    var wb = new xl.Workbook();

    var ws = wb.addWorksheet('Sheet 1');

    // Create a reusable style
    var style = wb.createStyle({
        font: {
            color: '#000000',
            size: 12
        },
        /*numberFormat: '$#,##0.00; ($#,##0.00); -'*/
    });

    ws.cell(1,1).string("날짜").style(style);
    ws.cell(1,2).string("시간").style(style);
    ws.cell(1,3).string("선거명").style(style);
    ws.cell(1,4).string("공개여부").style(style);
    ws.cell(1,5).string("참석여부").style(style);
    ws.cell(1,6).string("행사이름").style(style);
    ws.cell(1,7).string("지역").style(style);
    ws.cell(1,8).string("해당자").style(style);
    ws.cell(1,9).string("하실일").style(style);
    ws.cell(1,10).string("협업").style(style);
    ws.cell(1,11).string("설명").style(style);
    ws.cell(1,12).string("등록자").style(style);

    const data = JSON.parse(req.body.printData);

    var count = 2;

    for(var i in data) {

        //console.log(i);
        //console.log(data[i]);
        const jsonData = data[i];

        const electionName = jsonData.electionName;
        const visibility  = jsonData.visibility ;
        const attend  = jsonData.attend ;
        const eventName  = jsonData.eventName ;
        const location  = jsonData.location ;
        const applicant  = jsonData.applicant ;
        const work  = jsonData.work;
        const cooperation  = jsonData.cooperation ;
        const description  = jsonData.description ;
        const startDate  = jsonData.startDate ;
        const endDate = jsonData.endDate;
        const register = jsonData.register;

        const startDate1 = startDate.split(" ");
        const endDate1 = endDate.split(" ");

        const timeStr = startDate1[1] + " - " + endDate1[1];
        const day = startDate1[0];

        ws.cell(count,1).string(day).style(style);
        ws.cell(count,2).string(timeStr).style(style);
        ws.cell(count,3).string(electionName).style(style);
        ws.cell(count,4).string(visibility).style(style);
        ws.cell(count,5).string(attend).style(style);
        ws.cell(count,6).string(eventName).style(style);
        ws.cell(count,7).string(location).style(style);
        ws.cell(count,8).string(applicant).style(style);
        ws.cell(count,9).string(work).style(style);
        ws.cell(count,10).string(cooperation).style(style);
        ws.cell(count,11).string(description).style(style);
        if(register != undefined) {
            ws.cell(count,12).string(register).style(style);
        }

        ++count;
    }

    const dateFormat = require('dateformat');
    const day = dateFormat(new Date(), "yyyy-mm-dd h:MM:ss");

    const fileName = "excel-"+day+".xlsx";

    wb.write(fileName, res);


});




function getResource(body) {

    const startDate = new Date(body.startDate);
    startDate.setHours(startDate.getHours() - 9);

    const endDate = new Date(body.endDate);
    endDate.setHours(endDate.getHours() - 9);

    const object = {
        electionName: body.electionName,
        visibility: body.visibility,
        attend : body.attend,
        eventName : body.eventName,
        location : body.location,
        applicant : body.applicant,
        work : body.work,
        cooperation : body.cooperation,
        description : body.description,
        startDate : body.startDate,
        endDate : body.endDate,
        register: body.register
    };

    const event = {
        'summary': body.eventName,
        'location': body.location,
        'description': body.description,
        'start': {
            'dateTime': ISODateString(new Date(startDate).toLocaleString()),
            'timeZone': 'Asia/Seoul',
        },
        'end': {
            'dateTime': ISODateString(new Date(endDate).toLocaleString()),
            'timeZone': 'Asia/Seoul',
        },
        /*'recurrence': [
            'RRULE:FREQ=DAILY;COUNT=2'
        ],
        'attendees': [
            /!*{'email': 'lpage@example.com'},
            {'email': 'sbrin@example.com'},*!/
        ],
        'reminders': {
            'useDefault': false,
            'overrides': [
                {'method': 'email', 'minutes': 24 * 60},
                {'method': 'popup', 'minutes': 10},
            ],
        },*/
        "extendedProperties": {
            "private": object,
            "shared": {
                "empty": "empty"
            }
        },
    };

    return event;

}

function ISODateString(d){
    const split = d.split(" ");
    return split[0]+"T"+split[1]+"Z";
}


module.exports = router;
