import crypto from "crypto";
import l from "../../common/logger";
import { secureMorphSecret } from "../../common/config";
import ChameleonHash from "./helpers/chameleonHash";
import UserEncryptionModel from "../../models/UserEncryptionModel";
import BlockchainService from "./Blockchain.service";

class StoreVerificationService {
  /**
   * @description Store the given verification data into the database and corresponding hashes into the blockchain
   * @param {string} userName User Name of the user
   * @param {string} encryptionKey Encryption key of the user
   * @param {object} mutableData Mutable data of the user
   * @param {object} immutableData Immutable data of the user
   */
  async storeData(userName, encryptionKey, mutableData, immutableData) {
    try {
      const privateKeySalt = crypto
        .createHash("sha256")
        .update(encryptionKey + secureMorphSecret + userName)
        .digest("hex");

      const userEncryptionInstance = await UserEncryptionModel.findOne({
        privateKeySalt,
      });
      if (userEncryptionInstance) {
        return {
          message: "Data already stored",
        };
      }

      const mutableDataChameleonHash = ChameleonHash(
        JSON.stringify(mutableData)
      );
      const immutableDataHash = crypto
        .createHash("sha256")
        .update(JSON.stringify(immutableData))
        .digest("hex");

      const intializationVector = crypto.randomBytes(16).toString("hex");

      const cipher = crypto.createCipheriv(
        "aes-256-cbc",
        Buffer.from(secureMorphSecret, "hex"),
        Buffer.from(intializationVector, "hex")
      );
      const encryptedData =
        cipher.update(
          JSON.stringify({
            userName,
            mutableDataChameleonHash,
            immutableDataHash,
          }),
          "utf8",
          "hex"
        ) + cipher.final("hex");

      // Blockchain service call
      await BlockchainService.storeData(
        userName,
        encryptionKey,
        mutableDataChameleonHash,
        immutableDataHash
      );
      await UserEncryptionModel.create({
        privateKeySalt,
        intializationVector,
        encrytpedData: encryptedData,
      });

      return {
        message: "Data stored successfully",
      };
    } catch (error) {
      l.error(error, "[STORE VERIFICATION SERVICE]");
      throw error;
    }
  }
}

export default new StoreVerificationService();
