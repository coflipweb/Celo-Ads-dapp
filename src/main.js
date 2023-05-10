//import { ChainId, Token, TokenAmount, Pair, Trade, TradeType, Route } from '@uniswap/sdk'
import Web3 from 'web3'
import { newKitFromWeb3 } from '@celo/contractkit'
import BigNumber from "bignumber.js"
import AdsAbi from '../contract/Admarket.abi.json'
import erc20Abi from "../contract/erc20.abi.json"

const ERC20_DECIMALS = 18
const APaddress = "0xfA2C350016256A9C7D36A3226396261674C144A4"
const cUSDContractAddress = "0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1"

let kit
let contract
let AdSpaces

const _ads =[]

const connectCeloWallet = async function () {
  if (window.celo) {
      notification("⚠️ Please approve this DApp to use it.")
    try {
      await window.celo.enable()
      notificationOff()

      const web3 = new Web3(window.celo)
      kit = newKitFromWeb3(web3)

      const accounts = await kit.web3.eth.getAccounts()
      kit.defaultAccount = accounts[0]
      contract = new kit.web3.eth.Contract(AdsAbi, APaddress)

    } catch (error) {
      notification(`⚠️ ${error}.`)
    }
  } else {
    notification("⚠️ Please install the CeloExtensionWallet.")
  }
}

async function approve(_price) {
  const cUSDContract = new kit.web3.eth.Contract(erc20Abi, cUSDContractAddress)

  const result = await cUSDContract.methods
    .approve(APaddress, _price)
    .send({ from: kit.defaultAccount })
  return result
}

const getBalance = async function () {
    const totalBalance = await kit.getTotalBalance(kit.defaultAccount)
    const cUSDBalance = totalBalance.cUSD.shiftedBy(-ERC20_DECIMALS).toFixed(2)
    document.querySelector("#balance").textContent = cUSDBalance
}

const getAdSpaces = async function() {
  const _adSize = await contract.methods.adSpaceLength().call()

  for(let i =0; i < _adSize; i++){
    let _data = new Promise(async (resolve,reject) =>{
      let p =await contract.methods.getAdspace(i).call()
      resolve({
        index: i,
        owner: p[0],
        name:p[1],
        image: p[2],
        price: p[3],
        startTime : p[4],
        endTime: p[5],
        purchased: p[6],
        
      })
    })
    _ads.push(_data)
  }

  AdSpaces = await Promise.all(_ads)
  renderAdSpaces()
}

function renderAdSpaces() {
    document.getElementById("AdMarket").innerHTML = ""
    AdSpaces.forEach((_adspacee) => {
      const newDiv = document.createElement("div")
      newDiv.className = "col-md-4"
      newDiv.innerHTML = adspaceeTemplate(_adspacee)
      document.getElementById("AdMarket").appendChild(newDiv)
    })
}


function  adspaceeTemplate(_adspacee) {
  return `
    <div class="card mb-4">
      <img class="card-img-top" src="${_adspacee.image}" alt="...">
      </div>
      <div class="card-body text-left p-4 position-relative">
      <div class="translate-middle-y position-absolute top-0">
      ${identiconTemplate(_adspacee.owner)}
      </div>
      <h2 class="card-title fs-4 fw-bold mt-2">${_adspacee.name}</h2>
      <p class="card-text mb-4" style="min-height: 82px">
        ${_adspacee.price}             
      </p>
      <p class="card-text mt-4">
        <i class="bi bi-geo-alt-fill"></i>
        <span> Usage starts from ${_adspacee.startTime} to ${_adspacee.endTime}</span>
      </p>
      <a class="btn btn-lg btn-outline-dark BuyBtn fs-6 p-3" id=${
        _adspacee.index}
      >
        Buy adspacee for ${_adspacee.price}
      </a>
      <a class="btn btn-lg btn-outline-dark DeleteBtn fs-6 p-3" id=${
        _adspacee.index}
      >
        Delete AdSpace ${_adspacee.index}
      </a>
    </div>
  </div>
`
}  

function identiconTemplate(_address) {
  const icon = blockies
    .create({
      seed: _address,
      size: 8,
      scale: 16,
    })
    .toDataURL()

  return `
  <div class="rounded-circle overflow-hidden d-inline-block border border-white border-2 shadow-sm m-0">
    <a href="https://alfajores-blockscout.celo-testnet.org/address/${_address}/transactions"
        target="_blank">
        <img src="${icon}" width="48" alt="${_address}">
    </a>
  </div>
  `
}

function notification(_text) {
  document.querySelector(".alert").style.display = "block"
  document.querySelector("#notification").textContent = _text
}

function notificationOff() {
  document.querySelector(".alert").style.display = "none"
}

window.addEventListener("load", async () => {
  notification("⌛ Loading...")
  await connectCeloWallet()
  getBalance()
  notificationOff()
  getAdSpaces()
  
})


  
  document
  .querySelector("#newadSpaceBtn")
  .addEventListener("click", async () => {
    const params = [
      document.getElementById("newadSpaceName").value,
      document.getElementById("newadSpaceName").value,
      new BigNumber(document.getElementById("newadspaceePrice").value)
      .shiftedBy(ERC20_DECIMALS)
      .toString(),
      document.getElementById("newStartTime").value,
    ]
    
    try {
      const result = await contract.methods
        .createAdSpace(...params)
        .send({ from: kit.defaultAccount })
    } catch (error) {
      notification(`⚠️ ${error}.`)
    }
    notification(`🎉 You successfully added "${params[0]}".`)
    getAdSpaces()
  })

  
  document.querySelector("#adspaceeRender")
  .addEventListener("click", async () => {
    getAdSpaces()
  })

  document.querySelector("#AdMarket").addEventListener("click", async (e) => {
    if(e.target.className.includes("BuyBtn")) {
      const index = e.target.id
      
      if (AdSpaces[index].name != ""){
        
        try {
        await approve(new BigNumber(AdSpaces[index].price))
        const result = await contract.methods
          .purchaseAdSpace(index)
          .send({ from: kit.defaultAccount })
          .shiftedBy(ERC20_DECIMALS)
          .toString()
          notification(`🎉 You successfully Bought "${_AdSpaces[index].title}".`)
          getAdSpaces()
          getBalance()
          } catch (error) {
            notification(`⚠️ ${error}.`)
          }
      }      
    }
  })

    document.querySelector("#AdMarket").addEventListener("click", async (e) => {
      if(e.target.className.includes("DeleteBtn")) {
        const index = e.target.id
        
        if (AdSpaces[index].name != ""){
          
          try {
          const result = await contract.methods
            .DeleteAd(index)
            .send({ from: kit.defaultAccount })
            notification(`🎉 You successfully Deleted "${_AdSpaces[index].name}".`)
            getAdSpaces()
            getBalance()
            } catch (error) {
              notification(`⚠️ ${error}.`)
            }
        }
      }

  })
