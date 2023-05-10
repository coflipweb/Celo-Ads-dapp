//import { ChainId, Token, TokenAmount, Pair, Trade, TradeType, Route } from '@uniswap/sdk'
import Web3 from 'web3'
import { newKitFromWeb3 } from '@celo/contractkit'
import BigNumber from "bignumber.js"
import NetworksAbi from '../contract/Networks.abi.json'
import erc20Abi from "../contract/erc20.abi.json"

const ERC20_DECIMALS = 18
const APaddress = "0xbf2Ac58D115f2458E67c205699Ec461BC12b75A6"
const cUSDContractAddress = "0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1"

let kit
let contract
let Movies

const _Movies =[]

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
      contract = new kit.web3.eth.Contract(NetworksAbi, APaddress)

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

const getMovies = async function() {
  const _MoviesSize = await contract.methods.getMovies().call()

  for(let i =0; i < _MoviesSize; i++){
    let _data = new Promise(async (resolve,reject) =>{
      let p =await contract.methods.getMovie(i).call()
      resolve({
        index: i,
        productionCo: p[0],
        title:p[1],
        director: p[2],
        image : p[3],
        description: p[4],
        price: p[5],
        CopiesAvailable: p[6]
      })
    })
    _Movies.push(_data)
  }

  Movies = await Promise.all(_Movies)
  renderMovies()
}

function renderMovies() {
    document.getElementById("CINEMART").innerHTML = ""
    Movies.forEach((_Movie) => {
      const newDiv = document.createElement("div")
      newDiv.className = "col-md-4"
      newDiv.innerHTML = MovieTemplate(_Movie)
      document.getElementById("CINEMART").appendChild(newDiv)
    })
}


function  MovieTemplate(_Movie) {
  return `
    <div class="card mb-4">
      <img class="card-img-top" src="${_Movie.image}" alt="...">
      </div>
      <div class="card-body text-left p-4 position-relative">
      <div class="translate-middle-y position-absolute top-0">
      ${identiconTemplate(_Movie.productionCo)}
      </div>
      <h2 class="card-title fs-4 fw-bold mt-2">${_Movie.title}</h2>
      <p class="card-text mb-4" style="min-height: 82px">
        ${_Movie.description}             
      </p>
      <p class="card-text mt-4">
        <i class="bi bi-geo-alt-fill"></i>
        <span> Copies Available ${_Movie.CopiesAvailable}</span>
      </p>
      <a class="btn btn-lg btn-outline-dark BuyBtn fs-6 p-3" id=${
        _Movie.index}
      >
        Buy Movie 
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
  getMovies()
  
})


  
  document
  .querySelector("#newMovieBtn")
  .addEventListener("click", async () => {
    const params = [
      document.getElementById("newMovieName").value,
      document.getElementById("newMovieDirector").value,
      document.getElementById("newMovieImgUrl").value,
      document.getElementById("newMovieDescription").value,
      new BigNumber(document.getElementById("newMoviePrice").value)
      .shiftedBy(ERC20_DECIMALS)
      .toString(),
      document.getElementById("newMovieCopiesAvailable").value,
    ]
    
    try {
      const result = await contract.methods
        .addMovie(...params)
        .send({ from: kit.defaultAccount })
    } catch (error) {
      notification(`⚠️ ${error}.`)
    }
    notification(`🎉 You successfully added "${params[0]}".`)
    getMovies()
  })

  
  document.querySelector("#MovieRender")
  .addEventListener("click", async () => {
    getMovies()
  })

  document.querySelector("#CINEMART").addEventListener("click", async (e) => {
    if(e.target.className.includes("BuyBtn")) {
      const index = e.target.id
      
      if (_Movies[index].title != ""){
        
        try {
        await approve(new BigNumber(_Movies[index].price))
        const result = await contract.methods
          .BuyMovie(index)
          .send({ from: kit.defaultAccount })
          .shiftedBy(ERC20_DECIMALS)
          .toString()
          notification(`🎉 You successfully Bought "${_Movies[index].title}".`)
          getMovies()
          getBalance()
          } catch (error) {
            notification(`⚠️ ${error}.`)
          }
      }
      
    }

  })
