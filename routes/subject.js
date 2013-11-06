var dbClient = require('mongodb').MongoClient,
    ObjectID = require('mongodb').ObjectID,
    format = require('util').format;

var CONST = {
    DB_CONNECT: 'mongodb://sanji.com:27017/mud-quiz',
    DB_COLLECTION: 'subjects',
    DB_COLUMNS: ['q-question', 'q-code', 'q-tag', 'q-level', 'a-answer', 'a-code', 'create-time', 'modify-time']
};

exports.new = function (req, res) {
    if (req.route.method === 'get') {
        res.render('new');
        return;
    }
    if (req.route.method === 'post') {
        var t = +Date.now(),
            data = {};

        for(var len = CONST.DB_COLUMNS.length - 1; len >= 0; len--) {
            var key = CONST.DB_COLUMNS[len];
            if (req.body.hasOwnProperty(key)) {
                data[key] = req.body[key];
            }
        }
        data['create-time'] = data['modify-time'] = t;
        data['remove'] = false;
        dbClient.connect(CONST.DB_CONNECT, function (err, db) {
            var collection = db.collection(CONST.DB_COLLECTION);
            collection.insert(data, function (err, docs) {
                db.close();
                res.redirect('/subject/' + docs[0]._id);
            });
        });
    }
};

exports.list = function (req, res) {
    var id = req.params.id,
        isModify = !!(typeof req.query.modify !== 'undefined');

    dbClient.connect(CONST.DB_CONNECT, function (err, db) {
        var collection = db.collection(CONST.DB_COLLECTION);
        try {
            id = ObjectID(id);
        }
        catch (e) {
            console.error(e);
        }
        collection.findOne({_id: id}, function (err, docs) {
            db.close();
            if (docs === null) {
                res.redirect('/subject');
                return;
            }
            if (isModify) {
                var tags = {};
                for(var obj = docs['q-tag'], len = obj.length - 1; len >= 0; len--) {
                    if ('javascript' === obj[len]) {
                        tags.isJs = true;
                    }
                    else if ('html' === obj[len]) {
                        tags.isHtml = true;
                    }
                    else if ('css' === obj[len]) {
                        tags.isCss = true;
                    }
                    else if ('java' === obj[len]) {
                        tags.isJava = true;
                    }
                    else {
                        tags.other = obj[len];
                    }
                }
                res.render('modify', {data: docs, tags: tags});
            }
            else {
                res.render('list', {data: [docs]});
            }
        });
    });
};

exports.listAll = function(req, res){
    dbClient.connect(CONST.DB_CONNECT, function (err, db) {
        var collection = db.collection(CONST.DB_COLLECTION);
        collection.find({remove: false}, {sort: {'modify-time': -1}}).toArray(function(err, docs) {
            db.close();
            if (docs.length === 0) {
                res.redirect('/subject');
                return;
            }
            res.render('list', {data: docs});
        });
    });
};

exports.modify = function (req, res) {
    var id = req.params.id,
        t = +Date.now(),
        data = {};

    for(var len = CONST.DB_COLUMNS.length - 1; len >= 0; len--) {
        var key = CONST.DB_COLUMNS[len];
        if (req.body.hasOwnProperty(key)) {
            data[key] = req.body[key];
        }
    }
    data['modify-time'] = t;
    data['remove'] = false;
    dbClient.connect(CONST.DB_CONNECT, function (err, db) {
        var collection = db.collection(CONST.DB_COLLECTION);
        try {
            id = ObjectID(id);
        }
        catch (e) {
            console.error(e);
        }
        collection.update({_id: id}, {$set: data}, {safe: true}, function (err, count) {
            db.close();
            res.redirect('/subject/' + id);
        });
    });
};

exports.remove = function (req, res) {
    var id = req.params.id,
        t = +Date.now();

    dbClient.connect(CONST.DB_CONNECT, function (err, db) {
        var collection = db.collection(CONST.DB_COLLECTION);
        // not really remove from db
        try {
            id = ObjectID(id);
        }
        catch (e) {
            console.error(e);
        }
        // collection.remove({_id: id}, function (err, count) {
        collection.update({_id: id}, {$set: {remove: true, 'modify-time': t}}, {safe: true}, function (err, count) {
            db.close();
            res.redirect('/subjects');
        });
    });

};

exports.search = function (req, res) {
    var q = req.query.q;
    res.send(q);
};