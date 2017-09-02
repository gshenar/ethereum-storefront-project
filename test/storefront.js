require('babel-polyfill');
var Storefront = artifacts.require("./Storefront.sol");

contract('Storefront', function(accounts) {
  it("first account should be the owner", function() {
    return Storefront.deployed().then(function(instance) {
      return instance.owner.call();
    }).then(function(owner) {
      assert.equal(owner, accounts[0], "first account is not the owner");
    });
  });
  it("adding a product should return success", function() {
    var storefront;
    return Storefront.deployed().then(function(instance) {
      storefront = instance;
      return storefront.addProduct(1, 1000000, 3, { from: accounts[0] });
    }).then(function(result) {
      assert.isTrue(!!result.receipt.transactionHash, "Add product should succeed");
    });
  });
  it("product should be in stock and added and should be able to get price", function() {
    var storefront;
    return Storefront.deployed().then(async function(instance) {
      storefront = instance;
      var addProductResponse = await storefront.addProduct(2, 1000000, 3, {  from: accounts[0] });
      assert.isTrue(!!addProductResponse.receipt.transactionHash, "Add product should succeed");
      var productInfo = await storefront.getProductInfo.call(2, { from: accounts[0] });
      assert.equal(productInfo[0].toNumber(), 1000000, "Price of product should be correct");
      assert.equal(productInfo[1].toNumber(), 3, "Stock of product should be correct");
      assert.equal(productInfo[2], true, "Product must exist");
    });
  });
});
