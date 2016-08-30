var express    = require('express'),
    router     = express.Router(),
    auth       = require('../models/config/auth'),
    Parse      = require('parse/node').Parse,
    schedule   = require('node-schedule');

    Parse.initialize(
       auth.parseserver.clientID,     // applicationId
       auth.parseserver.clientSecret, // javaScriptKey
       auth.parseserver.clientSecret  // masterKey
    );

    Parse.serverURL = auth.parseserver.serverURL;
/***************
 *  The requests controller will take in the following http requests:
 *
 *    '/requests' - This will save the request in the database to record the
 *       types of request made by their users.
 *
 ********************************************************************/

  router.post('reminder', function (req, res) {
    //The reminder date that was provided by the client.  The date must not be in the past.
    var newUTDate = new Date(req.body.alertDate);
    //This is required because if a date in the past then it should send the reminder notifications out in the next minute;
    var currentDate = new Date(Date.now() + (1 * 60000));

    if(newUTDate <= currentDate )
       newUTDate = currentDate;
    //not sure why this is required but this is the only way I could get te scheduler to work
    var schRetVal= schedule.scheduleJob(new Date(
                newUTDate.getFullYear(),
                newUTDate.getMonth(),
                newUTDate.getDate(),
                newUTDate.getHours(), 
                newUTDate.getMinutes()), 
    function(){
         //add scheduled push notification
         var query = new Parse.Query(Parse.Installation)
          , data = {
              "alert"         :"Reminder, Michael is going to help you with basketball today",
          };

          query.equalTo("userid", 23); // send push to user
          query.equalTo("deviceType", "ios");

          //push_time is not supported in the parse-server.
          Parse.Push.send({
               where: query,
               data: data
            },
            {
               success: function () {
                   console.log("arguments", arguments);
                   console.log("User reminded of help today");
               },
               error: function (error) {
                 console.log("Error: " + error.code + " " + error.message);
              },
               useMasterKey: true
           });
      
      

      });
      console.log('test val go ', schRetVal);
      //If the schedule return value is empty (null) then send a failure reponse to the client app. 
      //If the return value is not null then send a success response to the client app. 
      if(schRetVal)
         res.json({code:100, message: 'Success'});
      else
         res.json({code: -100, message: 'Failed to Schedule Work Reminders. To start work, go to the Orders Screen'});

});
  
module.exports = router;
