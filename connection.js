const mysql =require('mysql');
require('dotenv').config();

var connection =mysql.createConnection({
    port: process.env.db_port,
    host: process.env.db_host,
    user: process.env.db_username,
    database: process.env.db_name
    
});
connection.connect((err)=>{
    if(!err){
        console.log("Connected");
    }
    else{
        console.log(err);
    }

});
module.exports=connection