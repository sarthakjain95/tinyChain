
console.log("%cGO!","background-color:black; padding:20px; color:white;");

// Locks the entire website down if the chain is invalid
function Lockdown(){
	document.body.style.boxShadow = "inset 0 0 3px #ab0027";
	document.body.style.webkitBoxShadow = "inset 0 0 3px #ab0027";
	document.getElementById("validity").innerHTML = "INVALID";
	document.getElementById("validity").style.border = "4px solid #ab0027";
	document.getElementById("validity").style.color = "#ab0027";
	for(let elem of document.getElementsByClassName("chain-form-input")) elem.disabled=true;
}

async function submitBlockData(){
	let data={};
	data["AMOUNT"]=Number(document.getElementById("amount").value);
	data["SENDER"]=document.getElementById("giver").value.toUpperCase();
	data["RECEPIENT"]=document.getElementById("receiver").value.toUpperCase();
	// console.log("Sending:",data);
	const options={
		method:'POST',
		body:JSON.stringify(data),
		cache: 'no-cache',
		credentials: 'same-origin', 
		headers: {
			'Content-Type': 'application/json',
		}
	}
	const response = await fetch('/chain',options);
	let val = await response.json();
	val=JSON.parse(val['data'])['blockChain'];
	if(!val['valid']){
		Lockdown();
	}else{
		document.getElementById("chain-length-holder").innerHTML = val['chainLength'];
		document.getElementById("total-exchange-holder").innerHTML = val['totalAmountExchange'];
		document.getElementById("rejected-blocks-holder").innerHTML = val['rejected_blocks'];
	}
}

// Toggles the check that core chain makes to ensure that the data is valid
async function toggleChainChecks(){
	const toggle_options={
		method:'POST',
		body:JSON.stringify({toggle:"toggle"}),
		cache: 'no-cache',
		credentials: 'same-origin', 
		headers: {
			'Content-Type': 'application/json',
		}
	}
	fetch('/chain',toggle_options);
}


// Automatically sends a request to the server to check if the chain is still valid.
(async function(){
	console.log("Hi there!\n\nCall toggleChainChecks() function to see the magic.");
	const options={
		method:'POST',
		body:JSON.stringify({is_valid:"?"}),
		cache: 'no-cache',
		credentials: 'same-origin', 
		headers: {
			'Content-Type': 'application/json',
		}
	}	
	const res = await fetch('/chain_validity',options);
	let response = await res.json();
	if(response['is_valid']==false) Lockdown();
})();
