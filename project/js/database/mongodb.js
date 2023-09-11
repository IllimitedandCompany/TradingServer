const { MongoClient, ServerApiVersion } = require('mongodb');

// MongoDB Vars
const uri = "mongodb+srv://franciscoT95:ft95@thecluster.eapnyil.mongodb.net/?retryWrites=true&w=majority";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
// End Of MongoDB Vars


function checkConnection(){
	client.connect(err => {
	  // Check connectivity
		console.log('Database connection successful..');
	});
}

module.exports =  {client, checkConnection};