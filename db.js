var Sequelize = require('sequelize');
var sequelize = new Sequelize(undefined, undefined, undefined, {
	'dialect': 'sqlite',
	'storage': __dirname + '/data/dev-todo-api.sqlite'
});
// var db = {};

// db.user = sequelize.import(__dirname + '/models/user.js');

// db.sequelize = sequelize;
// db.Sequelize = Sequelize;

// module.exports = db;

// var todo = sequelize.define('todo',{
// 	description: {
// 		type: Sequelize.STRING
// 	},
// 	completed: {
//        type: Sequelize.BOOLEAN
//   	}
// })
var db = {}

db.user = sequelize.import(__dirname + '/models/user.js');
db.token = sequelize.import(__dirname + '/models/token.js');
db.notification = sequelize.import(__dirname + '/models/notification.js');
db.teams = sequelize.import(__dirname + '/models/teams.js');

db.user.belongsTo(db.teams);

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;

// sequelize.sync().then(function () {
//     console.log('Everything is synced');

//     db.user.create({
//     	'email': 'ab@gmail.com',
//     	'password': '1234'
//     }).then(function(user) {
//           console.log(user);
//           console.log('finished!');
//     });
// });