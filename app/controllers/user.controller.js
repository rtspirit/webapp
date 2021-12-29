const bcrypt = require('bcrypt');
const multer = require('multer');
const path = require('path');
const { users } = require("../models");
const db = require("../models");
const User = db.users;
const Image = db.images;
const Op = db.Sequelize.Op;
const uploadFile = require("../middleware/upload");
const { uploadFileToS3 } = require("../../s3")
const { deleteFileFromS3 } = require("../../s3")
const fs = require("fs");
const util = require('util');
const baseUrl = "http://localhost:8080/v1/self/pic";
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser')
const SDCClient = require("statsd-client");
const sdcclient = new SDCClient({ host: 'localhost', port: 8080 });

// Create and Save a new User
exports.create = (req, res) => {
  // Validate request
  sdcclient.increment("Creating User");
  let startTime = new Date();

  if (!req.body.first_name) {
    res.status(400).send();
    return;
  }
  else if (!req.body.last_name) {
    res.status(400).send();
    return;
  }
  else if (!req.body.username) {
    res.status(400).send();
    return;
  }
  else if (!req.body.password) {
    res.status(400).send();
    return;
  }

  bcrypt.hash(req.body.password, 10, (err, hash) => {
    if (err) {
      res.status(500).json({
        error: err,
        message: "Some error occurred while creating the user"
      });
    }
    else {
      const userObject = {
        id: req.body.id,
        first_name: req.body.first_name,
        last_name: req.body.last_name,
        username: req.body.username,
        password: hash
      }
      User.create(userObject)
        .then(data => {


          console.log(data.id)
          const dataNew = {
            id: data.id,
            first_name: req.body.first_name,
            last_name: req.body.last_name,
            username: req.body.username,
            account_created: data.account_created,
            account_updated: data.account_updated
          }

          res.status(201).send({ dataNew });
        })
        .catch(err => {
          res.status(400).send();

        });
    }
  })
  let endTime = new Date();
  sdcclient.timing(
    "User creation time",
    endTime - startTime
  );

};

// // Retrieve all Users from the database.
// exports.findAll = (req, res) => {
//   const id = req.query.id;
//   var condition = id ? { id: { [Op.iLike]: `%${id}%` } } : null;

//   User.findAll({ where: condition })
//     .then(data => {
//       res.status(200).send(data);
//     })
//     .catch(err => {
//       res.status(500).send({
//         message:
//           err.message || "Some error occurred while retrieving Users."
//       });
//     });
// };

// Find a User with an id
exports.findOne = (req, res) => {
  sdcclient.increment("Finding User");
  let startTime = new Date();
  console.log('Finding one', res.locals);
  User.findByPk(req.params.id)
    .then(data => {
      res.status(200).send({
        id: data.id,
        first_name: data.first_name,
        last_name: data.last_name,
        username: data.username
      });
    })
    .catch(err => {
      res.status(500).send({
        error: err,
        message: "Error retrieving user with id=" + id
      });
    });
  let endTime = new Date();
  sdcclient.timing(
    "User Find time",
    endTime - startTime
  );
};

// Update a User by the id in the request


exports.update = (req, res) => {

  sdcclient.increment("Updating User");
  let startTime = new Date();
  bcrypt.hash(req.body.password, 10, (err, hash) => {
    if (err) {
      res.status(400).json({

        message: "Choose a user ID to update"
      });
    }
    else if (req.params.id == null) {
      res.status(400).json({
        message: "Choose a user ID to update"
      })
    }
    else {
      const id = req.params.id;

      if (req.body.username) {
        res.status(400).send({
          message: "Username cannot be updated"
        });
        return;
      }
      if (req.body.account_created) {
        res.status(400).send({
          message: "account_Created cannot be updated"
        });
        return;
      }
      if (req.body.account_updated) {
        res.status(400).send({
          message: "account_updated cannot be updated"
        });
        return;
      }
      const userUpdate = {
        first_name: req.body.first_name,
        last_name: req.body.last_name,
        username: req.body.username,
        password: hash
      }
      console.log("UserData", userUpdate)
      User.update(userUpdate, {
        where: { id: result.id }
      })
        .then(num => {
          if (num == 1) {
            res.status(200).send({
              message: "User was updated successfully."
            });
          } else {
            res.status(400).send({
              message: `Cannot update User with id=${id}. Maybe User was not found or req.body is empty!`
            });
          }
        })
        .catch(err => {
          res.status(500).send({
            message: "Error updating User with id=" + id
          });
        });

    }


  })
  let endTime = new Date();
  sdcclient.timing(
    "User Update time",
    endTime - startTime
  );
};


//Creating Image DB

exports.createImage = async (req, res, location) => {
  // await User.upload(req.body);
  // console.log(req.body)
  sdcclient.increment("Creating Image");
  let startTime = new Date();
  const user = await this.findUser(global.username)
  const imageData = ({

    file_name: req.file_name,
    id: user.id,
    url: location,
    upload_date: new Date(),
    user_id: user.id,

  })
  
  // console.log(imageData)
  const imageExists = await this.findImageByUserID(user.id)
  if (imageExists) {
    await Image.update(imageData, {
      where: {
        id: imageExists.id
      }
    })
  } else {
    await Image.create(imageData)
  }
  let endTime = new Date();
  sdcclient.timing(
    "Creating Image time",
    endTime - startTime
  );
  return imageData

}


// Uploading Image

exports.upload = async (req, res) => {
  sdcclient.increment("Uploading Image");
  let startTime = new Date();
  bodyParser.raw({
    limit: "3mb",
    type: ["image/*"],
  })
  console.log(req.body)
  if (!req.body) {
    return res.status(400).send();
  }
  try {
    const file = req.file
    const userData = await this.findUser(global.username)

    const result = await uploadFileToS3(req, res, userData);
    const imageObject = {
      file_name: result.Key,
      url: result.Location
    }
    console.log("inside upload", req.body)
    req.file_name = result.Key
    const location = result.Location
    const imageInfo = await this.createImage(req, res, location)
    
    res.status(201).send({
      message: "Profile pic added",
      imageInfo

    })

  } catch (err) {
    console.log(err);

    if (err.code == "LIMIT_FILE_SIZE") {
      return res.status(500).send({
        message: "File size cannot be larger than 2MB!",
      });
    }
    return res.status(400).send();

  }
  let endTime = new Date();
    sdcclient.timing(
      "Image Upload time",
      endTime - startTime
    );
};

exports.getListFiles = (req, res) => {
  sdcclient.increment("Fetching List");
  let startTime = new Date();
  const directoryPath = __basedir + "/resources/static/assets/uploads/";

  fs.readdir(directoryPath, function (err, files) {
    if (err) {
      res.status(500).send({
        message: "Unable to scan files!",
      });
    }

    let fileInfos = [];

    files.forEach((file) => {
      fileInfos.push({
        name: file,
        url: baseUrl + file,
      });
    });
    let endTime = new Date();
    sdcclient.timing(
      "Get List time",
      endTime - startTime
    );
    res.status(200).send(fileInfos);
  });
};

//find user by username



exports.findUser = async (username) => {
  let result = await User.findOne({
    where: {
      username: username
    }
  });
  return result;
}

// end find user by email id

//find image by userId

exports.findImageByUserID = async (userId) => {
  let result = await Image.findOne({
    where: {
      user_id: userId
    }
  });
  return result;
}

//fetch user data
exports.fetchUserData = async (req, res) => {
  sdcclient.increment("Uploading Image");
  let startTime = new Date();
  let result = await User.findOne({
    where: {
      username: global.username
    }
  });
  let endTime = new Date();
  sdcclient.timing(
    "Get User Data time",
    endTime - startTime
  );
  res.status(200).send({
    id: result.id,
    first_name: result.first_name,
    last_name: result.last_name,
    username: result.username,
    account_created: result.account_created,
    account_updated: result.account_updated
  })
}

//fetch image data by username

exports.fetchImageByUsername = async (req, res) => {
  sdcclient.increment("Searching UserName By Image");
  let startTime = new Date();
  let result = await User.findOne({
    where: {
      username: global.username
    }
  });
  console.log("UserData", req)
  const result1 = await Image.findOne({
    where: {
      user_id: result.id
    }
  })
    .then(data => {
      const imageData = {
        file_name: data.file_name,
        id: data.id,
        url: data.url,
        upload_date: data.upload_date,
        user_id: data.user_id
      }
      let endTime = new Date();
      sdcclient.timing(
        "Get Image by UserName time",
        endTime - startTime
      );
      res.status(200).send(imageData);
    })
    .catch(err => {
      console.log(err)
      res.status(404).send()
    })

}

//delete image data by userId

exports.deleteImageByUserId = async (req, res) => {
  sdcclient.increment("Deleting Image");
  let startTime = new Date();
  let result = await User.findOne({
    where: {
      username: global.username
    }
  });
  console.log("Request Body", req.body)
  let result1 = await Image.destroy({
    where: {
      user_id: result.id
    }
  });
  console.log("Inside delete", result1)
  await deleteFileFromS3(req, res, result)
    .then(data => {
      let endTime = new Date();
      sdcclient.timing(
        "Delete Image time",
        endTime - startTime);
      res.status(204).send()

    }
    )
    .catch(err => {
      res.status(404).send()
    })

}





// Delete a Users with the specified id in the request
exports.delete = (req, res) => {
  const id = req.params.id;

  User.destroy({
    where: { id: id }
  })
    .then(num => {
      if (num == 1) {
        res.status(200).send({
          message: "User was deleted successfully!"
        });
      } else {
        res.status(400).send({
          message: `Cannot delete User with id=${id}. User was not found!`
        });
      }
    })
    .catch(err => {
      res.status(500).send({
        message: "Could not delete User with id=" + id
      });
    });
};

// Delete all Users from the database.
exports.deleteAll = (req, res) => {
  User.destroy({
    where: {},
    truncate: false
  })
    .then(nums => {
      res.status(200).send({ message: `${nums} Users were deleted successfully!` });
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while removing all users."
      });
    });
};
