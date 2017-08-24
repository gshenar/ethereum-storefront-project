pragma solidity ^0.4.0;

contract Storefront {
    address public owner;
    address[] public administrators;
    mapping(uint => Product) public productCatalog;
    mapping(address => Receipt) receipts;

    struct Receipt {
        uint[] productsBought;
    }

    struct Product {
        uint price;
        uint stock;
    }

    function getReceipts() constant returns (uint[] productsBought) {
        return receipts[msg.sender].productsBought;
    }

    function addProduct(uint id, uint price, uint stock) returns(bool success) {
        require(msg.sender == owner);
        require(stock > 0); //Product must be in stock
        require(price > 0); //Product must not be free
        require(id != 0); //Don't allow an id of 0
        //TODO - is there a better way to check if a product exists in the catalog?
        require(productCatalog[id].price == 0);  //Can't add a product with an id that already exists
        productCatalog[id] = Product({
            price: price,
            stock: stock
        });
        return true;
    }

    function buyProduct(uint id) payable returns (bool success) {
        require(productCatalog[id].price != 0); //Product must exist
        require(productCatalog[id].stock != 0); //Product must be in stock
        require(productCatalog[id].price == msg.value); //User must buy exactly 1 item for now

        receipts[msg.sender].productsBought.push(id);
        productCatalog[id].stock--;
        return true;
    }

    function widthdraw() returns (bool success) {
        require(msg.sender == owner);
        owner.transfer(this.balance);
        return true;
    }

    function Storefront() {
        owner = msg.sender;
    }

}
