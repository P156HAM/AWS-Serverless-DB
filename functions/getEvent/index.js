const { sendResponse } = require("../../responses/index.js");
const { db } = require("../../src/db.js")

exports.handler = async (event, context) => {
  try {
    const items = await db.scan({
      TableName: "events-db",
      FilterExpression: "attribute_exists(#DYNOBASE_artist)",
      ExpressionAttributeNames: {
          "#DYNOBASE_artist": "artist"
      }
    }).promise();

    return sendResponse(200, { sucess: true, items })
  } catch (error) {
    return sendResponse(500, {sucess: false, message: error.message})
  }
};