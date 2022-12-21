// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./VRFConsumerBase.sol";

contract Random is VRFConsumerBase {
    
    bytes32 constant KEYHASH = bytes32(0xaa77729d3466ca35ae8d28b3bbac7cc36a5031efdc430821c02bc31a238af445);
    
    uint256 public lastRandomness;
    uint256 public counter;
    
    constructor (address coordinator, address link) VRFConsumerBase(coordinator, link) {

    }

    function fulfillRandomness(bytes32 requestId, uint256 randomness) internal override {
        lastRandomness = randomness;
        counter += 1;
    }

    function random(uint256 fee) external {
        requestRandomness(KEYHASH, fee);
    }
}