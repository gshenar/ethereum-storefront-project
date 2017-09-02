require('babel-polyfill');
var Storefront = artifacts.require("./Storefront.sol");

contract('Storefront', function(accounts) {
  it("first account should be the owner", async function() {
    var storefront =  await Storefront.deployed();
    var owner = await storefront.owner.call();
    assert.equal(owner, accounts[0], "first account is not the owner");
  });
  it("adding a product should return success", async function() {
    var storefront =  await Storefront.deployed();
    var result = await storefront.addProduct(1, 1000000, 3, { from: accounts[0] });
    assert.isTrue(!!result.receipt.transactionHash, "Add product should succeed");
  });
  it("product should be in stock and added and should be able to get price", async function() {
    var storefront =  await Storefront.deployed();
    var addProductResponse = await storefront.addProduct(2, 1000000, 3, {  from: accounts[0] });
    assert.isTrue(!!addProductResponse.receipt.transactionHash, "Add product should succeed");
    var productInfo = await storefront.getProductInfo.call(2, { from: accounts[0] });
    assert.equal(productInfo[0].toNumber(), 1000000, "Price of product should be correct");
    assert.equal(productInfo[1].toNumber(), 3, "Stock of product should be correct");
    assert.equal(productInfo[2], true, "Product must exist");
  });
});
