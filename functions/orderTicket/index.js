const { sendResponse } = require("../../responses/index.js");
const { v4: uuidv4 } = require('uuid');
const { db } = require("../../src/db.js")

async function findEvents () {
    const items = await db.scan({
        TableName: "events-db",
        FilterExpression: "attribute_exists(#DYNOBASE_artist)",
        ExpressionAttributeNames: {
            "#DYNOBASE_artist": "artist"
        }
    }).promise();
    return items;
}

exports.handler = async(event, context) => {
    try {
        const items = await findEvents()
        const body = JSON.parse(event.body)

        const events = items.Items;
        const foundEvent = events.find((e) => e.id == body.id && e.artist == body.artist)
        if (foundEvent && foundEvent.quantity >= 1) {
            const issuedTicket = {
                ticketId : uuidv4(),
                artist: foundEvent.artist,
                place: foundEvent.arena,
                date: foundEvent.date,
                time: foundEvent.time,
                verified: false
            }
            let quantity = foundEvent.quantity - 1
            await db.put({
                TableName: "tickets-db",
                Item: issuedTicket
            }).promise();
            await db.update({
                TableName: "events-db",
                Key: { id: foundEvent.id },
                ReturnValues: 'ALL_NEW',
                UpdateExpression: 'set quantity = :quantity',
                ConditionExpression: 'quantity > :limit',
                ExpressionAttributeValues: {
                    ':quantity': quantity,
                    ':limit': 0
                }
            }).promise();
            return sendResponse(200, {sucess: true, issuedTicket})
        } else {
            return sendResponse(500, {sucess: false, message: "No event was found for the given name or the ticket are sold out!"})
    }} 
    catch (error) {
        console.error("Error:", error)
        return sendResponse(500, { sucess: false, message: error.message })
    }
}
