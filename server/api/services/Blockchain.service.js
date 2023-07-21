import l from "../../common/logger.js";
import Web3 from "web3";
import abiData from "./helpers/abi";
import {
  providerUrl,
  contractAddress,
  privateKey,
} from "../../common/config.js";

const web3 = new Web3(providerUrl);
const contract = new web3.eth.Contract(abiData, contractAddress);
const account = web3.eth.accounts.privateKeyToAccount(privateKey);

web3.eth.accounts.wallet.add(account);
web3.eth.defaultAccount = account.address;

class BlockchainService {
  /**
   * @description Stores the user data in the blockchain
   * @param {string} userName  User Name of the user
   * @param {string} encryptionKey Encryption key of the user
   * @param {string} mutableDataChameleonHash Chameleon hash of the mutable data
   * @param {string} immutableDataHash Hash of the immutable data
   * @returns A message indicating the success or failure of the operation
   */
  async storeData(
    userName,
    encryptionKey,
    mutableDataChameleonHash,
    immutableDataHash
  ) {
    try {
      const recipt = await contract.methods
        .storeVerificationData(
          userName,
          mutableDataChameleonHash,
          immutableDataHash,
          encryptionKey
        )
        .send({
          from: web3.eth.defaultAccount,
          gas: 2000000,
        });
      return recipt;
    } catch (error) {
      l.error(error, "[BLOCKCHAIN SERVICE: STORE VERIFICATION]");
      throw error;
    }
  }

  /**
   * @description Verfies the user
   * @param {string} userName User Name of the user
   * @param {string} encryptionKey Encryption key of the user
   * @param {string} mutableDataChameleonHash  Chameleon hash of the mutable data
   * @param {string} immutableDataHash Hash of the immutable data
   * @returns A message indicating the success or failure of the operation
   */
  async verifyUser(
    userName,
    encryptionKey,
    mutableDataChameleonHash,
    immutableDataHash
  ) {
    try {
      const recipt = await contract.methods
        .verifyUserIdentity(
          encryptionKey,
          userName,
          mutableDataChameleonHash,
          immutableDataHash
        )
        .call();
      return recipt;
    } catch (error) {
      l.error(error, "[BLOCKCHAIN SERVICE: USER VERIFICATION]");
      throw error;
    }
  }

  /**
   * @description Deletes the user
   * @param {string} userName User Name of the user
   * @param {string} encryptionKey Encryption key of the user
   * @returns A message indicating the success of failure of the operation
   */
  async deleteUser(userName, encryptionKey) {
    try {
      const recipt = await contract.methods
        .deleteVerificationData(encryptionKey, userName)
        .send({
          from: web3.eth.defaultAccount,
          gas: 200000,
        });
      return recipt;
    } catch (error) {
      l.error(error, "[BLOCKCHAIN SERVICE: DELETE USER]");
      throw error;
    }
  }

  /**
   * @description Updates the encryption key of the user
   * @param {string} encryptionKey Encryption key of the user
   * @param {string} newEncryptionKey New encryption key of the user
   * @param {string} userName User Name of the user
   * @returns A message indicating the success or failure of the operation
   */
  async updateEncryptionKey(encryptionKey, newEncryptionKey, userName) {
    try {
      const recipt = await contract.methods
        .changeUserEncryptionKey(encryptionKey, newEncryptionKey, userName)
        .send({
          from: web3.eth.defaultAccount,
          gas: 200000,
        });
      return recipt;
    } catch (error) {
      l.error(error, "[BLOCKCHAIN SERVICE: UPDATE ENCRYPTION KEY]");
      throw error;
    }
  }

  /**
   * @description Updates the number of times key can be changed
   * @param {string} encryptionKey Encryption key of the user
   * @param {string} userName User Name of the user
   * @param {number} reduceCount Number to which count should be reduced
   * @returns A message indicating the success or failure of the operation
   */
  async reduceKeyUseCount(encryptionKey, userName, reduceCount) {
    try {
      const recipt = await contract.methods
        .reduceChangeCount(encryptionKey, userName, reduceCount)
        .send({
          from: web3.eth.defaultAccount,
          gas: 200000,
        });
      return recipt;
    } catch (error) {
      l.error(error, "[BLOCKCHAIN SERVICE: REDUCE KEY USE COUNT]");
      throw error;
    }
  }
}

export default new BlockchainService();
