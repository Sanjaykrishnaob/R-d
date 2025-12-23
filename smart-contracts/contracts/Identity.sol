// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

contract Identity {
    struct UserIdentity {
        string name;
        string ipfsHash; // Hash of the encrypted identity document
        bool isVerified;
        address walletAddress;
    }

    address public admin; // The Government/Verifier
    mapping(address => UserIdentity) public identities;
    address[] public userAddresses; // Keep track of all users to list them for the admin

    event IdentityCreated(address indexed user, string name);
    event IdentityVerified(address indexed user);

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can perform this action");
        _;
    }

    constructor() {
        admin = msg.sender; // The deployer is the admin
    }

    function createIdentity(string memory _name, string memory _ipfsHash) public {
        require(bytes(identities[msg.sender].name).length == 0, "Identity already exists");
        
        identities[msg.sender] = UserIdentity({
            name: _name,
            ipfsHash: _ipfsHash,
            isVerified: false,
            walletAddress: msg.sender
        });
        
        userAddresses.push(msg.sender);

        emit IdentityCreated(msg.sender, _name);
    }

    function getIdentity(address _user) public view returns (UserIdentity memory) {
        return identities[_user];
    }
    
    function verifyIdentity(address _user) public onlyAdmin {
        identities[_user].isVerified = true;
        emit IdentityVerified(_user);
    }

    function getAllUsers() public view returns (address[] memory) {
        return userAddresses;
    }
}