pragma solidity ^0.4.0;

contract Storefront {
    address public owner;
    mapping(address => bool) private administrators;
    mapping(uint => Product) private productCatalog;
    mapping(address => Receipt[]) private receipts;

    struct Receipt {
        uint productId;
        uint numberBought;
        uint pricePerProduct;
    }

    struct Product {
        uint price;
        uint stock;
    }

    modifier administratorsOnly {
        assert(administrators[msg.sender] == true);
        _;
    }

    event LogPurchase(uint productId, address buyer);
    event LogNewProduct(uint productId, uint price, uint stock);

    function getPrice(uint id) constant returns (uint productPrice) {
        require(productCatalog[id].price != 0);
        return productCatalog[id].price;
    }

    function getStock(uint id) constant returns (uint productStock) {
        require(productCatalog[id].price != 0);
        return productCatalog[id].stock;
    }

    function getReceiptCount() constant returns (uint numProductsBought) {
        return receipts[msg.sender].length;
    }

    function getReceipt(uint receiptNumber) constant returns (uint productId, uint numberBought, uint pricePerProduct) {
        require(receiptNumber < receipts[msg.sender].length);
        return (receipts[msg.sender][receiptNumber].productId, receipts[msg.sender][receiptNumber].numberBought,  receipts[msg.sender][receiptNumber].pricePerProduct);
    }

    function addProduct(uint id, uint price, uint stock) administratorsOnly returns(bool success) {
        require(stock > 0); //Product must be in stock
        require(price > 0); //Product must not be free
        require(id != 0); //Don't allow an id of 0
        //TODO - is there a better way to check if a product exists in the catalog?
        require(productCatalog[id].price == 0);  //Can't add a product with an id that already exists
        productCatalog[id] = Product({
            price: price,
            stock: stock
        });
        LogNewProduct(id, price, stock);
        return true;
    }

    function buyProduct(uint id) payable returns (bool success) {
        require(productCatalog[id].price != 0); //Product must exist
        require(productCatalog[id].stock != 0); //Product must be in stock
        require(productCatalog[id].price == msg.value); //User must buy exactly 1 item for now

        Receipt memory receipt = Receipt({
            productId: id,
            pricePerProduct: productCatalog[id].price,
            numberBought: 1
        });
        receipts[msg.sender].push(receipt);
        productCatalog[id].stock--;
        LogPurchase(id, msg.sender);
        return true;
    }

    function widthdraw() returns (bool success) {
        require(msg.sender == owner);
        owner.transfer(this.balance);
        return true;
    }

    function Storefront() {
        owner = msg.sender;
        administrators[msg.sender] = true;
    }

}
