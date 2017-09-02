// Import the page's CSS. Webpack will know what to do with it.
import "../stylesheets/app.css";

// Import libraries we need.
import { default as Web3} from 'web3';
import { default as contract } from 'truffle-contract'
var $ = require('jquery');

// Import our contract artifacts and turn them into usable abstractions.
import storefront_artifacts from '../../build/contracts/Storefront.json'

// Storefront is our usable abstraction, which we'll use through the code below.
var Storefront = contract(storefront_artifacts);

// The following code is simple to show off interacting with your contracts.
// As your needs grow you will likely need to change its form and structure.
// For application bootstrapping, check out window.addEventListener below.
var accounts;
var account;

window.App = {
  start: function() {
    var self = this;

    // Bootstrap the MetaCoin abstraction for Use.
    Storefront.setProvider(web3.currentProvider);

    // Get the initial account balance so it can be displayed.
    web3.eth.getAccounts(function(err, accs) {
      if (err != null) {
        alert("There was an error fetching your accounts.");
        return;
      }

      if (accs.length == 0) {
        alert("Couldn't get any accounts! Make sure your Ethereum client is configured correctly.");
        return;
      }

      accounts = accs;
      account = accounts[0];
      self.intitalizeHeader();
      self.refreshProductList();
      self.refreshPurchasesList();
    });
  },

  setStatus: function(message) {
    var status = document.getElementById("status");
    status.innerHTML = message;
  },

  intitalizeHeader: async function() {
    try {
      var storefront = await Storefront.deployed();
      var owner = await storefront.owner.call();
      if(owner == account) {
        $(".not-admin").css({"display": "none"});
      }
    } catch(e) {
      console.log(e);
      this.setStatus("Error getting balance; see log.");
    }
  },

  buyProduct: async function() {
    var self = this;
    var productId = parseInt(document.getElementById("productIdToBuy").value);

    this.setStatus("Buying product... Please wait...");

    try {
      var storefront = await Storefront.deployed();
      var productInfo = await storefront.getProductInfo.call(productId, {from: account});
      alert("price of produuct: " + productInfo[0]);
      var buyProductResponse = await storefront.buyProduct(productId, {value: productInfo[0].toNumber(), from: account});
      self.setStatus("Product bought");
      self.refreshProductList();
    } catch(e) {
      console.log(e);
      self.setStatus("Error buying product; see log.");
    }
  },

  refreshPurchasesList: async function() {
    try {
      var storefront = await Storefront.deployed();
      var numReceipts = await storefront.getReceiptCount.call({from: account});
      $(".purchases").empty();
      for(var i = 0; i < numReceipts.toNumber(); i++) {
        return storefront.getReceipt.call({from: account}).then(function(receiptInfo) {
            $(".purchases").append("<div> Product:" + receiptInfo.productId + "</div>");
        });
      }
    } catch(e) {
      console.log(e);
      this.setStatus("Error getting receipts; see log.");
    }
  },

  refreshProductList: function() {

  },

  addProduct: async function() {
    var productId = parseInt(document.getElementById("productId").value);
    var productStock = parseInt(document.getElementById("productStock").value);
    var productPrice = document.getElementById("productPrice").value;
    this.setStatus("Adding product to catalog... Please wait...");
    try {
      var storefront = await Storefront.deployed();
      await storefront.addProduct(productId, productPrice, productStock, {from: account});
      this.setStatus("Product Added to catalog");
      this.refreshProductList();
      return;
    } catch(e) {
      console.log(e);
      this.setStatus("Error creating product; see log.");
    }
  }
};

window.addEventListener('load', function() {
  // Checking if Web3 has been injected by the browser (Mist/MetaMask)
  if (typeof web3 !== 'undefined') {
    console.warn("Using web3 detected from external source. If you find that your accounts don't appear or you have 0 MetaCoin, ensure you've configured that source properly. If using MetaMask, see the following link. Feel free to delete this warning. :) http://truffleframework.com/tutorials/truffle-and-metamask")
    // Use Mist/MetaMask's provider
    window.web3 = new Web3(web3.currentProvider);
  } else {
    console.warn("No web3 detected. Falling back to http://localhost:8545. You should remove this fallback when you deploy live, as it's inherently insecure. Consider switching to Metamask for development. More info here: http://truffleframework.com/tutorials/truffle-and-metamask");
    // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
    window.web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
  }

  App.start();
});
