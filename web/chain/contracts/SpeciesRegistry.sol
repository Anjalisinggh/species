// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title SpeciesRegistry
/// @notice Public, permanent record of Species.family species and their evolution stages.
/// Gameplay (follows, quests, moderation) stays off-chain. The app's server holds the
/// `attester` key and signs a statement only when its database agrees, so nothing can be
/// registered or evolved here that did not happen in the game. Holds no funds and no tokens.
contract SpeciesRegistry {
    struct Species {
        address creator;      // wallet that registered it
        uint8 stage;          // 0..3, mirrors the game's evolution stage
        uint64 registeredAt;
        uint64 evolvedAt;
        string slug;
        string tokenRef;      // optional pointer to a token elsewhere, e.g. "solana:<mint>" for Bags
    }

    uint8 public constant MAX_STAGE = 3;
    bytes32 private constant REGISTER = keccak256("SpeciesRegistry.register");
    bytes32 private constant EVOLVE = keccak256("SpeciesRegistry.evolve");

    address public owner;
    address public attester;
    uint256 public total;
    mapping(bytes32 => Species) private _species;

    event SpeciesRegistered(bytes32 indexed id, address indexed creator, string slug);
    event SpeciesEvolved(bytes32 indexed id, uint8 stage);
    event TokenRefSet(bytes32 indexed id, string tokenRef);
    event AttesterChanged(address indexed attester);
    event OwnershipTransferred(address indexed owner);

    error NotOwner();
    error NotCreator();
    error AlreadyRegistered();
    error NotRegistered();
    error BadStage();
    error BadSignature();
    error BadInput();

    constructor(address attester_) {
        if (attester_ == address(0)) revert BadInput();
        owner = msg.sender;
        attester = attester_;
        emit OwnershipTransferred(msg.sender);
        emit AttesterChanged(attester_);
    }

    /// @notice Register a species. `sig` is the attester's approval for exactly this id, slug and caller.
    function register(bytes32 id, string calldata slug, bytes calldata sig) external {
        if (_species[id].creator != address(0)) revert AlreadyRegistered();
        if (bytes(slug).length == 0 || bytes(slug).length > 64) revert BadInput();
        _check(keccak256(abi.encode(REGISTER, block.chainid, address(this), id, msg.sender, keccak256(bytes(slug)))), sig);
        _species[id] = Species(msg.sender, 0, uint64(block.timestamp), 0, slug, "");
        unchecked { total++; }
        emit SpeciesRegistered(id, msg.sender, slug);
    }

    /// @notice Record the next evolution stage. Anyone may submit it; the attester signature is what authorises it.
    function recordEvolution(bytes32 id, uint8 stage, bytes calldata sig) external {
        Species storage s = _species[id];
        if (s.creator == address(0)) revert NotRegistered();
        if (stage != s.stage + 1 || stage > MAX_STAGE) revert BadStage();
        _check(keccak256(abi.encode(EVOLVE, block.chainid, address(this), id, stage)), sig);
        s.stage = stage;
        s.evolvedAt = uint64(block.timestamp);
        emit SpeciesEvolved(id, stage);
    }

    /// @notice Creator-only pointer to an optional token. Informational: this contract never touches the token.
    function setTokenRef(bytes32 id, string calldata tokenRef) external {
        if (_species[id].creator != msg.sender) revert NotCreator();
        if (bytes(tokenRef).length > 128) revert BadInput();
        _species[id].tokenRef = tokenRef;
        emit TokenRefSet(id, tokenRef);
    }

    function getSpecies(bytes32 id) external view returns (Species memory) {
        return _species[id];
    }

    function setAttester(address attester_) external {
        if (msg.sender != owner) revert NotOwner();
        if (attester_ == address(0)) revert BadInput();
        attester = attester_;
        emit AttesterChanged(attester_);
    }

    function transferOwnership(address owner_) external {
        if (msg.sender != owner) revert NotOwner();
        if (owner_ == address(0)) revert BadInput();
        owner = owner_;
        emit OwnershipTransferred(owner_);
    }

    function _check(bytes32 hash, bytes calldata sig) private view {
        if (sig.length != 65) revert BadSignature();
        bytes32 r = bytes32(sig[0:32]);
        bytes32 s = bytes32(sig[32:64]);
        uint8 v = uint8(sig[64]);
        // Reject malleable signatures (upper-half s), as OpenZeppelin's ECDSA does.
        if (uint256(s) > 0x7FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF5D576E7357A4501DDFE92F46681B20A0) revert BadSignature();
        address signer = ecrecover(keccak256(abi.encodePacked("\x19Ethereum Signed Message:\n32", hash)), v, r, s);
        if (signer == address(0) || signer != attester) revert BadSignature();
    }
}
