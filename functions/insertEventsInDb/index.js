const { sendResponse } = require("../../responses/index.js");
const { db, params } = require("../../src/db.js")


exports.handler = async (event, context) => {
    try {
      await db.batchWrite(params, (err, data) => {
        if(err) {
          console.log("items can not be added:", err)
        } else {
          console.log("items added successfully:", data)
        }
    
      }).promise();

      return sendResponse(200, {message: "Items added successfully!"})
    } catch (error) {
      return sendResponse(500, {sucess: false, message: error.message})
    }
    };