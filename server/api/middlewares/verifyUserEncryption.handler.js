import crypto from "crypto";
import l from "../../common/logger";
import errorHandler from "./error.handler";
import UserEncryptionModel from "../../models/UserEncryptionModel";
import { secureMorphSecret } from "../../common/config";

/**
 @description Verifies if the user has encryption enabled
 */
export default async function verifyUserEncryption(req, res, next) {
  try {
    const { userName, encryptionKey } = req.body;

    // Calculating hash of the encryption key and secure morph secret
    const hash = crypto
      .createHash("sha256")
      .update(encryptionKey + secureMorphSecret + userName)
      .digest("hex");

    // Searching for the user encryption data if there exist any privateKeySalt
    const userEncryptionData = await UserEncryptionModel.findOne({
      privateKeySalt: hash,
    }).lean();

    if (!userEncryptionData) {
      return res.status(400).json({ message: "Encryption key is incorrect" });
    }

    // Decrypting the encrypted data
    const decipher = crypto.createDecipheriv(
      "aes-256-cbc",
      Buffer.from(secureMorphSecret, "hex"),
      Buffer.from(userEncryptionData.intializationVector, "hex")
    );

    let decrypted =
      decipher.update(userEncryptionData.encrytpedData, "hex", "utf8") +
      decipher.final("utf8");

    decrypted = JSON.parse(decrypted);

    // Checking if the decrypted data is correct
    if (decrypted.userName !== userName) {
      return res.status(400).json({ message: "Encryption key is incorrect" });
    }

    // Adding the decrypted data to the request body
    req.body.userDecryptedData = decrypted;

    next();
  } catch (error) {
    error.status = 400;
    l.error(error, "[AUTH HANDLER]");
    errorHandler(error, req, res, next);
  }
}
