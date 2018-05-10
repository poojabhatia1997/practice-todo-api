module.exports = function(sequelize, DataTypes) {
	return sequelize.define('notifications', {
		id: {
                  primaryKey: true,
                  type: DataTypes.UUID,
                  defaultValue: DataTypes.UUIDV4,
                },
		sender: {
			type: DataTypes.INTEGER,
			allowNull: false
		    },
	    receiver: {
	    	type: DataTypes.INTEGER,
			allowNull: false
	    },
	    text: {
	    	type: DataTypes.STRING,
	    	allowNull: false
	    },
	    type: {
	    	type: DataTypes.INTEGER,
			allowNull: false
	    },
	    status: {
	    	type: DataTypes.INTEGER,
			allowNull: false
	    }
	});
}