// var bcrypt = require('bcrypt');
// var _ = require('underscore');
// var cryptojs = require('crypto-js');
// var jwt = require('jsonwebtoken');
module.exports = function(sequelize, DataTypes){
        return sequelize.define('user',{         
             email: {
                 type: DataType.STRING,
                 allowNull: false,
                 unique: true,
                 validate: {
                    isEmail: true
                 }
             },
             password: {
                 	type: DataType.STRING,     
                 	allowNull: false,
                 	validate: {
                 		   len: [7,50]
                  	}
            }
        });       
};