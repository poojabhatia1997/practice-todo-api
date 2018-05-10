var crypto = require('crypto-js');

module.exports = function(sequelize, DataTypes) {
	return sequelize.define('New_Token', {
		token: {
			type: DataTypes.STRING,
			allowNull: false,
			validate: {
				len: [1]
		    },
		    set: function (value) {
              
               this.setDataValue('token', value);
 
		    }
	    }
	});
}