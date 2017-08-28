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
    return Storefront.deployed().then(function(instance) {
      storefront = instance;
      return storefront.addProduct(2, 1000000, 3, {  from: accounts[0] });
    }).then(function(result) {
        console.log(JSON.stringify(result));
       assert.isTrue(!!result.receipt.transactionHash, "Add product should succeed");
       return storefront.getPrice.call(2, { from: accounts[0] });
    }).then(function(price) {
       assert.equal(price.toNumber(), 1000000, "Price of product should be correct");
       return storefront.getStock.call(2, { from: accounts[0] });
    }).then(function(stock) {
       assert.equal(stock.toNumber(), 3, "Stock of product should be correct");
    });
  });
});
