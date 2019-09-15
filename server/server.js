
const express = require('express');
const db = require('nedb');
// Contains core implementation of block chain
// Also contains the main block chain
const core = require('./core.js');

const app = express();
const database = new db("../requests/request_data.db");
database.loadDatabase();

// Deleting previous database
database.remove( {}, { multi: true }, (err, numDeleted)=>console.log('Deleted', numDeleted, 'entries') );   

// localhost:3000
app.listen( 3000, ()=>console.log("SERVING AT PORT 3000") );
// Website
app.use( express.static("blockTrack") );
app.use( express.json({ limit:'1mb' }) );


app.post( '/chain' , (request,response)=> {
	console.log("RECEIVED",Date.now(), request.body);
	database.insert( { time:Date.now(), data:request.body } );
	if(request.body['toggle']==undefined){
		core.blockChain.addBlock( new core.BLOCK( Date.now(), request.body ) );
		response.json({
			status:"RECEIVED",
			data:JSON.stringify(core)
		});
	}else{
		core.blockChain.toggleChecks();
		response.json({ status:"OK" });
	}
})

// Website automatically sends a request after loading to check if the chain is valid.
app.post('/chain_validity' , (request,reponse)=>{ reponse.json( { is_valid:core.blockChain.valid } ); })

// MAIN SERVER FILE