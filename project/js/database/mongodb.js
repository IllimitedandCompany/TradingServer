const { MongoClient, ServerApiVersion } = require('mongodb');

const DBusername = "YourChoice";
const DBpassword = "YourChoice";

// MongoDB Vars
const uri = `mongodb+srv://${DBusername}:${DBpassword}@thecluster.eapnyil.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
// End Of MongoDB Vars


function checkConnection(){
	client.connect(err => {
	  // Check connectivity
		console.log('Database connection successful..');
	});
}

module.exports =  {client, checkConnection};