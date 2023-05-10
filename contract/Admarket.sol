// SPDX-License-Identifier: MIT

pragma solidity >=0.7.0 <0.9.0;

interface IERC20Token {
    function transfer(address, uint256) external returns (bool);

    function approve(address, uint256) external returns (bool);

    function transferFrom(address, address, uint256) external returns (bool);

    function totalSupply() external view returns (uint256);

    function balanceOf(address) external view returns (uint256);

    function allowance(address, address) external view returns (uint256);

    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(
        address indexed owner,
        address indexed spender,
        uint256 value
    );

}


// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

// Define the contract
contract AdMarketplace {
    
    // Struct for the advertisement space
    struct AdSpace {
        address owner;
        string name;
        string image;
        uint256 price;
        uint256 startTime;
        uint256 endTime;
        bool purchased;
    }
    
    // Owner of the marketplace
    address public owner;
    
    //adSpace Counter
    uint public AdSpacesCount;

    // Mapping of advertisement spaces
    mapping (uint256 => AdSpace) public adSpaces;

    address internal cUSDContractAddress = 0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1;

    //mapping for Authorized Advertizers
    mapping (address => bool) internal Authorized;
    
    // Event for purchasing an advertisement space
    event AdSpacePurchased(uint256 adSpaceId, address purchaser, uint256 price);
    
    // Constructor to set the owner of the marketplace
    constructor() {
        owner = msg.sender;
    }
    
    // Modifier to only allow the owner of the marketplace to perform certain actions
    modifier onlyOwner() {
        require(msg.sender == owner, "Only the owner of the marketplace can perform this action.");
        _;
    }

    

    
    
    // Function for advertisers authorized by the owner of the marketplace to create an advertisement space
    function createAdSpace(string calldata name, string calldata image, uint256 price, uint256 startTime) public {
        // Only allow authorized advertisers to create advertisement spaces
        require(Authorized[msg.sender] , "Only authorized advertisers can create advertisement spaces.");
        
        // Create the advertisement space struct
        AdSpace memory adSpace = AdSpace({
            owner: msg.sender,
            name: name,
            image: image,
            price: price,
            startTime: startTime,
            endTime: startTime + 30 days, // advertisement space can be used for 24 hours
            purchased: false
        });
        
        // Add the advertisement space to the mapping
        adSpaces[AdSpacesCount] = adSpace;
        AdSpacesCount++;
    }
    
    // Function for companies authorized by the marketplace owner to purchase an advertisement space
    function purchaseAdSpace(uint256 adSpaceId, uint price) public payable {
        // Only allow authorized companies to purchase advertisement spaces
        require(msg.sender == owner, "Only authorized companies can purchase advertisement spaces.");
        
        // Get the advertisement space from the mapping
        AdSpace storage adSpace = adSpaces[adSpaceId];
        
        // Check that the advertisement space has not already been purchased
        require(!adSpace.purchased, "This advertisement space has already been purchased.");
        
        // Check that the purchase is being made at least 6 hours before the start time of the advertisement space
        require(adSpace.startTime - block.timestamp >= 6 hours, "This advertisement space cannot be purchased less than 6 hours before the start time.");
        
        // Check that the correct amount of ether is being sent
        require(price == adSpace.price, "Incorrect amount of ether sent.");
        
        // Transfer the ether to the owner of the advertisement space
        address payable ownerAddress = payable(adSpace.owner);
        require(IERC20Token(cUSDContractAddress).transferFrom(msg.sender, adSpace.owner, adSpace.price), "transfer Failed");
        // Mark the advertisement space as purchased
        adSpace.purchased = true;
        // Emit the AdSpacePurchased event
       
        emit AdSpacePurchased(adSpaceId, msg.sender, adSpace.price);
    }

    function DeleteAd(uint _index) public{
        require((adSpaces[_index].owner == msg.sender), "Only and ad Space owner can delete an ad space");
        delete adSpaces[_index] ;
    }
    
    function adSpacesLength() public view returns(uint){
        return(AdSpacesCount);
    }

    function getAdspace(uint _Id)public view returns(address,string memory,string memory, uint, uint, uint, bool){
       AdSpace storage Adsp = adSpaces[_Id];
       return(
        Adsp.owner,
        Adsp.name,
        Adsp.image,
        Adsp.price,
        Adsp.startTime,
        Adsp.endTime,
        Adsp.purchased
       );
    }
}
