const bodyParser = require("body-parser");
const { Sequelize } = require("../models/index.js");

module.exports = app => {
    const user = require("../controllers/user.controller.js");
    const auth = require("../middleware/auth")
    const multer = require('multer');
    const bodyParser = require('body-parser')
    const uploadFileToS3 = require("../../s3")
    var router = require("express").Router();
  
    // Create a new User
    router.post("/", user.create);
  
    // Retrieve all Users
    // router.get("/", user.findAll);
  
    // Retrieve all published Users
  
    // Retrieve a single User with id
    router.get("/self", auth, user.fetchUserData);
    
    router.get("/healthCheck", (req,res) => {
      res.send(200);
    })
    // Update a User with id
    router.put("/self", auth, user.update);

    // Adding/Updating a picture for a user

    router.post("/self/pic",auth, user.upload);
   

    // Retrieve a user image

    router.get("/self/pic", auth, user.fetchImageByUsername);

    //delete image by userId

    router.delete("/self/pic",auth,user.deleteImageByUserId);

    // router.post("/self/pic", (req, res, next) => {
    //   console.log(req.body)
    //   const imageData = {
    //     name: req.body.name
    //   };    
    // }, user.upload);

    // Deleting a User image

    router.delete("/self/pic", user.delete);

  
    // Delete a User with id
    // router.delete("/:id", user.delete);
  
    // // Delete all User
    // router.delete("/", user.deleteAll);


    

    app.use("/v1/user", router);



    // ROUTE TO POST IMAGE


    // app.post("/self/pic", function(req, res, next) {
    //   var data = new Buffer('');
    //   req.on('data', function(chunk) {
    //       data = Buffer.concat([data, chunk]);
    //   });
    //   req.on('end', function() {
    //     req.rawBody = data;
    //     res.send("Success");
    //     next();
    //   });
    // });

  };