var dbClient = require('mongodb').MongoClient,
    ObjectID = require('mongodb').ObjectID,
    format = require('util').format;

var CONST = {
    DB_CONNECT: 'mongodb://sanji.com:27017/mud-quiz',
    DB_COLLECTION: 'subjects',
    DB_COLUMNS: ["q-question", "q-code", "q-tag", "a-answer", "a-code", "create-time", "modify-time"]
};

exports.new = function (req, res) {
    if (req.route.method === 'get') {
        res.render("subject-new");
        return;
    }
    if (req.route.method === 'post') {
        var t = +Date.now(),
            data = {};

        for(var len = CONST.DB_COLUMNS.length - 1;len >= 0; len--) {
            var key = CONST.DB_COLUMNS[len];
            if (req.body.hasOwnProperty(key)) {
                data[key] = req.body[key];
            }
        }
        data['create-time'] = data['modify-time'] = t;
        dbClient.connect(CONST.DB_CONNECT, function (err, db) {
            if (err) {
                throw err;
            }
            var collection = db.collection(CONST.DB_COLLECTION);
            collection.insert(data, function (err, docs) {
                if (err) {
                    throw err;
                }
                db.close();
                res.redirect("/subject/" + docs[0]._id);
                return;
            });
        });
    }
};

exports.list = function (req, res) {
    var id = req.params.id;
    dbClient.connect(CONST.DB_CONNECT, function (err, db) {
        if (err) {
            throw err;
        }
        var collection = db.collection(CONST.DB_COLLECTION);
        collection.findOne({_id: ObjectID(id)}, function (err, docs) {
            if (err) {
                throw err;
            }
            db.close();
            if (docs === null) {
                res.redirect("/subject");
                return;
            }
            res.render("subject-list", {data: [docs]});
        });
    });
};

exports.listAll = function(req, res){
    dbClient.connect(CONST.DB_CONNECT, function (err, db) {
        if (err) {
            throw err;
        }
        var collection = db.collection(CONST.DB_COLLECTION);
        collection.find().toArray(function(err, docs) {
            if (err) {
                throw err;
            }
            db.close();
            if (docs.length === 0) {
                res.redirect("/subject");
                return;
            }
            res.render("subject-list", {data: docs});
        });
    });
};

exports.modify = function (req, res) {
    var id = req.params.id;
    res.render("subject-list", {text: "modify subject " + id});
};


exports.remove = function (req, res) {
    var id = req.params.id;
    res.render("subject-list", {text: "remove subject " + id});
};