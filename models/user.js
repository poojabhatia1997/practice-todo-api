var bcrypt = require('bcrypt');
var _ = require('underscore');
var cryptojs = require('crypto-js');
var jwt = require('jsonwebtoken');

module.exports = function(sequelize, DataType){
        var user = sequelize.define('New_Users_Data',{ 
             id: {
                  primaryKey: true,
                  type: DataType.UUID,
                  defaultValue: DataType.UUIDV4,
                },
             email: {
                 type: DataType.STRING,
                 allowNull: false,
                 unique: true,
                 validate: {
                    isEmail: true
                 }
             },
             salt: {
                 type: DataType.STRING
             },
             password_hash: {
                type: DataType.STRING
             },
             password: {
                    type: DataType.VIRTUAL,  
                    allowNull: true,
                    validate: {
                           len: [2,50]
                    },
                  set: function (value) {

                              var salt = bcrypt.genSaltSync(10);              
                              var hashedPassword = bcrypt.hashSync(value, salt);  
                              this.setDataValue('password',value);
                              this.setDataValue('salt',salt);
                              this.setDataValue('password_hash',hashedPassword);
                          }  
            },
            profileImage: {
                 type: DataType.STRING,
                 allowNull: true
             }

        }, {
        hooks: {
          beforeValidate: function(user, options){
            if (typeof user.email === 'string')
              user.email = user.email.toLowerCase();
          }
        },
        instanceMethods: {                                // create own instance method
          toPublicJSON: function () {                   // this refers to instance(user.toPublicJSON) this means user
                  var json = this.toJSON();
                  return _.pick(json,'id','email','salt','profileImage','createdAt','updatedAt');      //returned methods in res.json
                }
        }
  });           
        return user;
} 
