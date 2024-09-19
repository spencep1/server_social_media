const express = require('express')
const app = express()
const sqlite3 = require("sqlite3")

const bcrypt = require('bcrypt')

var bodyParser = require('body-parser');
const cors = require('cors');

const jwt = require('jsonwebtoken');

app.use(cors());
app.use(bodyParser.json());

var cookie_secret = "fortniteamongus";
var tokens_given = {};

//app.use(express.static(path.join(__dirname, "public")));
app.use(express.static("public"));

//db.run("CREATE DATABASE test;")
//let db = new sqlite3.Database(':memory:');
let db
db = new sqlite3.Database('./test.db', (err)=>{
	if(err){
		console.log("creating database")
		db = new sqlite3.Database('./test.db', sqlite3.OPEN_READWRITE)
	}
})

db.run(`CREATE TABLE passwords (
    id INTEGER PRIMARY KEY,
	username CHAR(255), 
	password CHAR(255));`, (err)=>{
		if(err){
			console.log(err);
			console.log("password table already made")
		}
	})

db.run(`CREATE TABLE posts (
    id INTEGER PRIMARY KEY,
	username CHAR(255), 
	title CHAR(10),
	body CHAR(255),
	timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP);`, (err)=>{
		if(err){
			console.log(err);
			console.log("table already made")
		}
	})

function authenticate(token, username){
	let rtrn_value = false
	jwt.verify(token, cookie_secret, (err, username) => {
    	if(err){
    		console.log(err)
    		rtrn_value = false
    	}else if(username == username){
			console.log("valid acess in auth function")
			rtrn_value = true;
		}else{
			console.log("invalid cookie or secret")
			rtrn_value = false
		}
	})
	return rtrn_value
}

app.get('/message', (req, res) => {
  const data = { message: 'Hello from Node.js backend!' };
  res.json(data);
});
app.post('/echo', (req, res) => {
  const data = { message: req.body.message };
  console.log("server echoing message: " + req.body.message);
  res.json(data);
});


app.post("/register", (req, res, next) =>{
	console.log(`username:${req.body.username} password:${req.body.password}`)
	bcrypt.hash(req.body.password, 10).then(hashed =>{
		console.log(hashed)

		let query = "SELECT COUNT(1) FROM passwords WHERE username = '" + req.body.username + "';"
		db.get(query, (err, val)=>{
			if (err){
				console.log("error");
				res.json({error: true, duplicate_name: false, registered: false});
			}else if(val['COUNT(1)'] == 0){
				console.log(req.body.username + " does not already exist")
				db.run(`INSERT INTO passwords (username, password)
				 	VALUES (?, ?);`, 
				 	[req.body.username, hashed],  
				 	(err)=>{
				 	if(err){
				 		console.log(err)
				 	}
				})
				res.json({error: false, duplicate_name: false, registered: true});
			}else{
				res.json({error: false, duplicate_name: true, registered: false});
			}	
		})
	})
})

app.post("/login", bodyParser.json(), (req, res, next) =>{
	console.log(req.body);
	console.log(`username:${req.body.username} password:${req.body.password}`)
	
	let query = "SELECT password FROM passwords WHERE username = '" + req.body.username + "';"
	db.get(query, (err, val)=>{
		if (err){
				console.log("error");
				res.json({error: true, log_in_sucess: false, invalid_name: false, invalid_password: false, token: undefined});
		}else if(!val){
				res.json({error: false, log_in_sucess: false, invalid_name: true, invalid_password: false, token: undefined});
		}else{
			console.log(val)
			bcrypt.compare(req.body.password, val['password']).then(valid =>{
				if(valid){
					let json_token = jwt.sign({username: req.body.username}, cookie_secret,  { expiresIn: '1h' });
					console.log(json_token);
					res.json({error: false, log_in_sucess: true, invalid_name: false, invalid_password: false, token: json_token});
				}else{
					res.json({error: false, log_in_sucess: false, invalid_name: false, invalid_password: true, token: undefined});
				}
			})
		}
	})
})
//INSERT INTO posts (username, title, body) VALUE (req.body.username, req.body.title, req.body.body)
/*{
	username : username,
	token: token,
	title: title,
	body: body
}*/
app.post('/post', (req, res) => {
	if(!authenticate(req.body.token, req.body.username)){
		res.json({authenticated: false, sucess: false, error: false});
		return;
	}

    var query = "INSERT INTO posts (username, title, body) VALUES ('"+req.body.username+"', '"+req.body.title+"', '"+req.body.body + "');"
    console.log(query);
    var error = false;
    db.run(query, ( err)=>{
		if(err){
			console.log(err);
			console.log("error with posting");
			error = true;
		}
	  var data;
	  if(error == true){
	  	data = {authenticated: true, sucess: false, error: true};
	  }else{
	  	data = {authenticated: true, sucess: true, error: false};
	  }
	  res.json(data);

	})
});
//DELETE FROM posts WHERE id = req.body.id AND username = req.body.username;
/*{
	username : username,
	token: token,
	title: title,
	body: body
}*/
app.delete('/post', (req, res) => {
	console.log(req.body.token + " " + req.body.username + " " + req.body.id);

	if(!authenticate(req.body.token, req.body.username)){
		res.json({authenticated: false, sucess: false, error: false});
		return;
	}

  var query = "DELETE FROM posts WHERE id = "+req.body.id + " AND username = '"+req.body.username +"';"
  var error = false;
  db.run(query, ( err)=>{
		if(err){
			console.log(err);
			console.log("error with deleting");
			error = true;
		}
	  var data;
	  if(error == true){
	  	data = {authenticated: true, sucess: false, error: true};
	  }else{
	  	data = {authenticated: true, sucess: true, error: false};
	  }
	  res.json(data);

	})
});
//UPDATE posts SET title = req.body.title, body = req.body.body, WHERE id = req.body.id AND username = req.body.username; 
/*{
	username : username
	token : token
	id : id;
	title: title
	body: body
}*/
app.put('/post', (req, res) => {
	if(!authenticate(req.body.token, req.body.username)){
		res.json({authenticated: false, sucess: false, error: false});
		return;
	}
  var query = "UPDATE posts SET title = '" + req.body.title +"', body = '" + req.body.body+"' WHERE id = " + req.body.id + " AND username = '" + req.body.username + "';"
  var error = false;
  console.log(query);
  db.run(query, ( err)=>{
		if(err){
			console.log(err);
			console.log("error with updating");
			error = true;
		}
		var data;
	  	if(error == true){
	  		data = {authenticated: true, sucess: false, error: true};
	  	}else{
	  		data = {authenticated: true, sucess: true, error: false};
	  	}
	  	res.json(data);
	})
});
//SELECT TOP number_of_rows * FROM Posts ORDER BY id DESC WHERE ();
/*{
	username : username
	token : token
	number_of_rows: number_of_rows
	where_clause: where_clause
}*/
app.get('/post', (req, res) => {
  var query = "SELECT *, ROW_NUMBER() OVER() FROM posts WHERE " +  req.query.where_clause + " ORDER BY id DESC LIMIT " + req.query.number_of_rows  + ";"
  var error = false;
  console.log(query);
  var response;
  db.all(query, (err, rows) =>{
		if(err){
			console.log(err);
			console.log("error with select statemtn");
			error = true;
		}else if(rows == undefined){
			console.log("no data");
			error = true;
			response = rows;
		}else{
			response = rows;
		}

	  var data;
	  if(error == true){
	  	data = {data:{}, authenticated: true, sucess: false, error: true};
	  }else{
	  	data = {data:response, authenticated: true, sucess: true, error: false};
	  }
	  console.log(data);
	  res.json(data);

	})
});

app.listen(2999, () => {
	console.log('server on port 2999')
})

console.log("hi")