pragma solidity >=0.4.24;
/**
  * @title Simple Storage
  * @dev Read and write values to the chain
  */
contract Passport {
    bool public fullyVaccinated;
    uint public doseCount;
    string public publicKey;

    struct Dose {
      uint doseNumber;
      string vaccineManufacturer;
    }

    mapping(uint => Dose) public doses;
    mapping(string => uint) public requiredDoses;

    function addDose(string memory vaccineManufacturer, uint requiredDose) public {
      doses[doseCount++] = Dose(doseCount, vaccineManufacturer);
      requiredDoses[vaccineManufacturer] = requiredDose;

      uint dosesTaken = 0;
      for (uint i=0; i < doseCount; i++) {
        // string comparison
        if (keccak256(abi.encodePacked(doses[i].vaccineManufacturer)) == keccak256(abi.encodePacked(vaccineManufacturer))) {
          dosesTaken++;
        }
      }
  
      fullyVaccinated = dosesTaken >= requiredDoses[vaccineManufacturer];
      emit doseAdded();
    }

    event doseAdded ();
}