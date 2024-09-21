![server_social_media drawio (1)](https://github.com/user-attachments/assets/a23f953e-4743-4433-bf36-e7e7b461f708)

Hello this is an API for the react website that allows for the storage of social media like posts.</br>
</br>
Making a GET request with the extension /message sends a test message</br>
</br>
Making a POST request with the extension /echo will send back the message that was sent with the parameter "message" in the message</br>
</br>
Making a POST request with the extension /register will register an account will store a hashed pashword in an sql database to use to verify registered users. You send a request with paramaters, "username" and "password". You must use a username that has not been registered yet. The server will respond with a JSON that shows the result of the request</br>
</br>
Making a POST request with the extension /login will log you into an account when you send in a valid username and password in the paramaters of the request. It will check the username and unencrypt and check the password to see if it is a valid pair stored in the database. It will then send back a JSON that shows the result of the request, if it was a valid login, it will send back a token to use validate the log in.</br>
</br>
Making a POST request with the extension /post will make a post when you send in a title, body and token parameters with the request. It will store the message in an sql database if the token is valid. It will then send back a JSON that shows the result of the request.</br>
</br>
Making a DELETE request with the extension /post with the username, post_id and token paramters will delete a post that matches the post_id and username from an sql database if the token is valid. It will then send back a JSON that shows the result of the request.</br>
</br>
Making a PUT request with the extension /post with the username, post_id, title, body and token paramters will update a post that matches the post_id and username from an sql database with the title and body in the request if the token is valid. It will then send back a JSON that shows the result of the request.</br>
</br>
Making a GET request with the extension /post needs a "where_clause" paramater and a "number_of_posts" paramaters. The "where_clause" is the WHERE section in a SQL get request where you specify what type of rows you want and the "number_of_posts" is the number of posts that you want back that match that "where_clause". It will then send back a JSON that shows the result of the request along with any data that was grabbed from the sql database.</br>

