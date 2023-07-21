import crypto from "crypto";
import l from "../../common/logger";
import { secureMorphSecret } from "../../common/config";
import ChameleonHash from "./helpers/chameleonHash";
import UserEncryptionModel from "../../models/UserEncryptionModel";
import BlockchainService from "./Blockchain.service";

class UserVerificationService {
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
      // Blockchain service call
      await BlockchainService.verifyUser(
        userName,
        encryptionKey,

        mutableDataChameleonHash,
        immutableDataHash
      );
      return {
        message: "User verified successfully",
      };
    } catch (error) {
      l.error(error, "[USER VERIFICATION SERVICE]");
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
  async deleteUser(
    userName,
    encryptionKey,
    mutableDataChameleonHash,
    immutableDataHash
  ) {
    try {
      // Blockchain service call
      await BlockchainService.deleteUser(userName, encryptionKey);

      const privateKeySalt = crypto
        .createHash("sha256")
        .update(encryptionKey + secureMorphSecret + userName)
        .digest("hex");

      await UserEncryptionModel.deleteOne({
        privateKeySalt,
      });

      return {
        message: "User Deleted Successfully",
      };
    } catch (error) {
      l.error(error, "[USER VERIFICATION SERVICE: DELETE USER]");
      throw error;
    }
  }

  /**
   * @description Update the encryption key of the user
   * @param {string} userName User Name of the user
   * @param {string} encryptionKey Old Encryption key of the user
   * @param {string} newEncryptionKey New encryption key of the user
   * @returns A message indicating the success or failure of the operation
   */
  async updateEncryptionKey(userName, encryptionKey, newEncryptionKey) {
    try {
      // Blockchain service call
      await BlockchainService.updateEncryptionKey(
        encryptionKey,
        newEncryptionKey,
        userName
      );
      // Generating the older privateKeySalt
      const privateKeySalt = crypto
        .createHash("sha256")
        .update(encryptionKey + secureMorphSecret + userName)
        .digest("hex");

      // Generating the new privateKeySalt
      const newPrivateKeySalt = crypto
        .createHash("sha256")
        .update(newEncryptionKey + secureMorphSecret)
        .digest("hex");

      // Updating the privateKeySalt
      await UserEncryptionModel.updateOne(
        { privateKeySalt },
        { privateKeySalt: newPrivateKeySalt }
      );

      return {
        message: "Encryption key updated successfully",
      };
    } catch (error) {
      l.error(error, "[USER VERIFICATION SERVICE: UPDATE USER KEY]");
      throw error;
    }
  }

  /**
   * @description Reduce the encryption key use count
   * @param {string} userName User Name of the user
   * @param {string} encryptionKey Encryption key of the user
   * @param {string} reduceCount Number to which the use count should be reduced
   * @returns A message indicating the success or failure of the operation
   */
  async reduceKeyUseCount(userName, encryptionKey, reduceCount) {
    try {
      // Blockchain service call
      await BlockchainService.reduceKeyUseCount(
        encryptionKey,
        userName,
        reduceCount
      );

      return {
        message: "Encryption key use count reduced successfully",
      };
    } catch (error) {
      l.error(error, "[USER VERIFICATION SERVICE: REDUCE KEY USE COUNT]");
      throw error;
    }
  }
}

export default new UserVerificationService();
