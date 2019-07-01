const path = require('path');

const express = require('express');

const bodyParser = require('body-parser');

const app = express();

const port = process.env.PORT || 3000

const Joi = require('@hapi/joi');

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
 
// parse application/json
app.use(bodyParser.json());

//require our database
const db = require('./dbConnection.js');

const collection = "todo";

app.get('/', (req, res) => {
	res.sendFile(path.join(__dirname, 'index.html'));
})


const schema = Joi.object().keys({
    todo: Joi.string().required()
})


//get all todos
app.get('/get-todos', (req, res) => {
	db.getDB().collection(collection).find({}).toArray((err, documents) => {
		if (err) {
			console.log(err);
		} else {
			console.log(documents);
			res.json(documents);
		}
	})
})

//update
app.put('/:id', (req, res) => {
	const todoID = req.params.id;
	const newUserInput = req.body;
	db.getDB().collection(collection).findOneAndUpdate({_id: db.getPrimaryKey(todoID)}, {$set: {todo: newUserInput.todo}}, {returnOriginal: false}, (err, result) => {
		if (err)
			console.log(err);
		else
			res.json(result);
	})
})

//creat
app.post('/', (req, res, next) => {
	const userInput = req.body;
	Joi.validate(userInput, schema, (err, value) => {
		if (err) {
			const error = new Error('Invalid User Input');
			error.status = 400;
			next(error);
		} else {
			db.getDB().collection(collection).insertOne(userInput, (err, result) => {
				if (err)
					console.log(err);
				else {
					res.json({result: result, document: result.ops[0], msg: 'Todo Added Successfully', error: null});
					next();
				}
			})
		}
	});
	
})



//delete
app.delete('/:id', (req, res) => {
	const todoID = req.params.id;
	db.getDB().collection(collection).findOneAndDelete({_id: db.getPrimaryKey(todoID)}, (err, result) => {
		if (err)
			console.log(err);
		else
			res.json(result);
	})
})

app.delete('/deleteAll', (req, res) => {
	db.getDB().collection(collection).deleteMany({}, (err, result) => {
		if (err)
			console.log(err)
		else
			res.json(result);
	})
})


db.connect((err) => {
	if (err) {
		console.log(err);
		process.exit(1);
	} else {
		app.listen(port, () => {
			console.log(`Todo Application Running On ${port}`);
		});
	}
});

app.use((err, req, res, next) => {
	res.status(err.status).json({
		error: {
			message: err.message
		}
	})
})



