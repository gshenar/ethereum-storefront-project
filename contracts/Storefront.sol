pragma solidity ^0.4.0;

contract Owned {
    address public owner;
    function Owned() {
        owner = msg.sender;
    }
}

contract Administrated {
    mapping(address => bool) internal administrators;
}

contract Storefront is Owned, Administrated {
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
        bool exists;
    }

    modifier administratorsOnly {
        require(administrators[msg.sender] == true);
        _;
    }

    event LogPurchase(uint productId, address buyer);
    event LogNewProduct(uint productId, uint price, uint stock);
    event LogWithdrawal(address recipient);
    event LogProductRemoved(uint productId);

    function Storefront() {
        owner = msg.sender;
        administrators[msg.sender] = true;
    }

    function getProductInfo(uint id) constant returns (uint productPrice, uint productStock, bool exists)
    {
        return (productCatalog[id].price, productCatalog[id].stock, productCatalog[id].exists);
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
        require(productCatalog[id].exists == false);  //Can't add a product with an id that already exists
        productCatalog[id] = Product({
            price: price,
            stock: stock,
            exists: true
        });
        LogNewProduct(id, price, stock);
        return true;
    }

    function buyProduct(uint id) payable returns (bool success) {
        require(productCatalog[id].exists == true); //Product must exist
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

    function removeProduct(uint id) administratorsOnly returns (bool success) {
        require(productCatalog[id].exists == true); //Fail if product never existed
        productCatalog[id].exists = false;
        productCatalog[id].stock = 0;
        productCatalog[id].price = 0;
        LogProductRemoved(id);
        return true;
    }

    function widthdraw() returns (bool success) {
        require(msg.sender == owner);
        owner.transfer(this.balance);
        LogWithdrawal(msg.sender);
        return true;
    }
}
