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


contract MovieStore {
    
    struct Movie {
        address productionCo;
        string title;
        string director;
        string image;
        string description;
        uint256 price;
        uint CopiesAvailable;
    }
    
    mapping (uint256 => Movie) public movies;
    uint256 public movieCount;
    
    address public owner;
    mapping (address => bool) public authorized;
    
    event MovieAdded(uint256 movieId,string title,string director);
    event MoviePurchased(uint256 movieId,string title,string director);
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Only the owner can call this function.");
        _;
    }

    modifier onlyAuthorized(){
        require(authorized[msg.sender]);
        _;
    }
    
    constructor() {
        owner = msg.sender;
        authorized[owner] = true;
    }
    
    function addMovie(string calldata _title, string calldata _image,string calldata _description, string calldata _director, uint256 _price, uint _CopiesAvailable) public onlyAuthorized() {
        movieCount++;
        movies[movieCount] = Movie(msg.sender, _title, _director, _image, _description, _price, _CopiesAvailable);
        emit MovieAdded(movieCount,_title,_director);
    }
    
    function authorize(address _address) public onlyOwner {
        authorized[_address] = true;
    }
    
    function revoke(address _address) public onlyOwner {
        authorized[_address] = false;
    }
    
    function buyMovie(uint256 _movieId) public payable {
        require(authorized[msg.sender], "Only authorized users can purchase movies.");
        require(movies[_movieId].price == msg.value, "Incorrect amount of Ether sent.");
        require(movies[_movieId].CopiesAvailable > 0, "Movie has already been purchased.");
        movies[_movieId].CopiesAvailable--;
        getMovie(_movieId);
        emit MoviePurchased(_movieId, movies[_movieId].title, movies[_movieId].director);
    }
    
    function getMovie(uint256 _movieId) public view returns (address, string memory,string memory, string memory, string memory, uint256, uint) {
        return (movies[_movieId].productionCo ,movies[_movieId].title, movies[_movieId].director,movies[_movieId].image, movies[_movieId].description, movies[_movieId].price, movies[_movieId].CopiesAvailable);
    }

    function getMovies() public view returns(uint) {
        return(movieCount);
    }
}
