module.exports = function(sequelize, DataTypes) {
	return sequelize.define('teams', {
		id: {
                 primaryKey: true,
                 type: DataTypes.UUID,
                 defaultValue: DataTypes.UUIDV4,
                },
		teamName: {
				type: DataTypes.STRING,
				allowNull: false
		    },
	    teamCaptain: {
	    	type: DataTypes.STRING,
			allowNull: false
	    },
	    teamPlayers: {
	    	type: DataTypes.STRING,
	    	allowNull: false
	    },
	    teamImage: {
	    	type: DataTypes.STRING,
			allowNull: true
	    }
	});
}