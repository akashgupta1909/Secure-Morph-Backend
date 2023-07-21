import l from "../../../common/logger";
import StoreVerificationService from "../../services/storeVerification.service";

export class Controller {
  /**
   * @description Store the given verification data into the database and corresponding hashes into the blockchain
   * @returns A message indicating the success or failure of the operation
   */
  async storeVerification(req, res, next) {
    try {
      const { userName, encryptionKey, mutableData, immutableData } = req.body;

      if (!userName || !encryptionKey || !mutableData || !immutableData) {
        return res.status(400).json({
          message:
            "Please send all the required field to update your information",
        });
      }

      const response = await StoreVerificationService.storeData(
        userName,
        encryptionKey,
        mutableData,
        immutableData
      );

      return res.status(200).json(response);
    } catch (error) {
      l.error(error, "[STORE VERIFICATION CONTROLLER]");
      next(error);
    }
  }
}
export default new Controller();
