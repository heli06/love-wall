var mongodb = require('./db');

/*
 * 集合`users`的文档`User`构造函数
 * @param {Object} user: 包含用户信息的一个对象
 */
function User(user) {
	this.name = user.name;
	this.password = user.password;
	this.email = user.email;
	this.friends = [];
}

module.exports = User;

/*
 * 保存一个用户到数据库
 * @param {Function} callback: 执行完数据库操作的应该执行的回调函数
 */
User.prototype.save = function save(callback) {
	var user = {
		name: this.name,
		password: this.password,
		email: this.email,
		friends: this.friends
	};

	mongodb.open(function(err, db) {
		if (err) {
			return callback(err);
		}
		db.collection('users', function(err, collection) {
			if (err) {
				mongodb.close();
				return callback(err);
			}

			// collection.ensureIndex('name', {unique: true});
			collection.insert(user, {safe: true}, function(err, user) {
				mongodb.close();
				callback(err, user);
			});
		});
	});
};


/*
 * 查询在集合`users`是否存在一个指定用户名的用户
 * @param {String} username: 需要查询的用户的名字 
 * @param {Function} callback: 执行完数据库操作的应该执行的回调函数
 */
User.get = function get(username, callback) {
	mongodb.open(function(err, db) {
		if (err) {
			return callback(err);
		}

		db.collection('users', function(err, collection) {
			if (err) {
				mongodb.close();
				return callback(err);
			}

			collection.findOne({name: username}, function(err, doc) {
				mongodb.close();
				if (doc) {
					var user = new User(doc);
					callback(err, user);
				} else {
					callback(err, null);
				}
			});
		});
	});
};

/*
 * 查询在集合`users`是否存在一个指定邮箱的用户
 * @param {String} username: 需要查询的用户的邮箱
 * @param {Function} callback: 执行完数据库操作的应该执行的回调函数
 */
User.getEmail = function get(Email, callback) {
	mongodb.open(function(err, db) {
		if (err) {
			return callback(err);
		}

		db.collection('users', function(err, collection) {
			if (err) {
				mongodb.close();
				return callback(err);
			}

			collection.findOne({email: Email}, function(err, doc) {
				mongodb.close();
				if (doc) {

					var user = new User(doc);
					callback(err, user);
				} else {
					callback(err, null);
				}
			});
		});
	});
};

User.getFriends = function get(username, callback) {
	mongodb.open(function(err, db) {
		if (err) {
			return callback(err);
		}

		db.collection('users', function(err, collection) {
			if (err) {
				mongodb.close();
				return callback(err);
			}
			collection.findOne({name: username}, function(err, doc) {
				mongodb.close();
				if (doc) {
					var friends = doc.friends;
					//console.log(doc);
					callback(err, friends);
				} else {
					callback(err, null);
				}
			});
		});
	});
};


User.addFriends = function get(username, friendname, callback) {
	mongodb.open(function(err, db) {
		if (err) {
			return callback(err);
		}

		db.collection('users', function(err, collection) {
			if (err) {
				mongodb.close();
				return callback(err);
			}

			collection.findOne({name: username}, function(err, doc) {
				if (doc) {
					var newfriends = doc.friends;
					newfriends.push(friendname);
					//console.log(doc);
					collection.update({name: username},{"$set":{"friends":newfriends}});
					mongodb.close();
					callback(err, newfriends);
				} else {
					mongodb.close();
					callback(err, null);
				}
			});
		});
	});
};