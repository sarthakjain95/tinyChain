
const SHA256 = require("crypto-js/sha256");

// types
// 0: GENESIS BLOCK
// 1: HIGH AMOUNT TRANSACTION BLOCK		AMOUNT > 1e5
// 2: MID AMOUNT TRANSACTION BLOCK		1e5 > AMOUNT > 1e2
// 3: LOW AMOUNT TRANSACTION BLOCK		1e2 > AMOUNT > 0

const difficulty=4;

class BLOCK{
	constructor(time, data){
		this.index=0;
		this.time=time.toString();
		this.data=JSON.stringify(data);
		this.parsed_data=data;
		this.level=this.getLevel();
		
		this.isValid=this.checkBlock();

		this.type=this.getBlockType();		
		this.previousHash="";
		this.hash="";
	}

	getBlockType(){
		const d=this.parsed_data;
		if(d['RECEPIENT']=="ROOT") return 0;
		else if(d['AMOUNT']>1e5) return 1;
		else if(d['AMOUNT']<1e5 && d['AMOUNT']>1e2) return 2;
		else return 3;
	}

	checkBlock(){
		const d=this.parsed_data;
		if( d['AMOUNT']==undefined || d['SENDER']==undefined || d['RECEPIENT']==undefined ) return false;
		else if( isNaN(Number(d['AMOUNT'])) ) return false;
		else if(d['SENDER'].trim()=="" || d['RECEPIENT'].trim()=="") return false;
		else if( Number(d['AMOUNT'])==0 && d['SENDER']!='ROOT' ) return false;
		else if( isNaN(Number(this.time)) || Object.keys(d).length!=3 ) return false;
		else return true;
	}

	getLevel(){ return Math.random(); }

	getHash(){
		// console.log("GENERATING HASH");
		let hash="";
		while(hash.slice(0,difficulty)!=Array(difficulty+1).join('0')){
			this.level=this.getLevel();
			hash=SHA256( this.index+this.data+this.time+this.previousHash+this.level.toString() ).toString();
		}
		return hash;
	}

}

class BLOCK_CHAIN{
	
	constructor(){
		this.chain=[new BLOCK(Date.now().toString(), {AMOUNT:0, SENDER:"ROOT", RECEPIENT:"ROOT"})];
		this.chain[0].hash=this.chain[0].getHash();
		this.chainLength=1;
		this.valid=true;
		this.totalAmountExchange=0;
		this.rejected_blocks=0;
		this.checksDisabled=false;
	}

	getLastBlock(){ return this.chain[this.chain.length - 1]; }

	toggleChecks(){ this.checksDisabled = this.checksDisabled ? false : true; }

	addBlock(block){
		if(!this.valid) return;

		block.previousHash=this.getLastBlock().hash;
		block.index=this.chainLength;
		block.hash=block.getHash();

		if( (block.isValid && this.valid) || this.checksDisabled ){ 
			this.totalAmountExchange+=block.parsed_data['AMOUNT'];
			this.chain.push(block);
			this.valid = this.isStillValid();
			this.chainLength++;
		}else{ 
			this.rejected_blocks++;
			return;
		}
	}

	isStillValid(){ 
		for(let i=1; i<this.chain.length;i++)
			if(this.chain[i].previousHash!=this.chain[i-1].hash || !this.chain[i].isValid)
				return false;
		return true;
	}


}

let blockChain = new BLOCK_CHAIN();

module.exports  = { blockChain, BLOCK };
