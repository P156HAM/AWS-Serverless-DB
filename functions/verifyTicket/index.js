const { sendResponse } = require("../../responses/index.js");
const { db } = require("../../src/db.js")

async function findTicket (ticketId) {
    const ticket = await db.get({
        TableName: "tickets-db",
        Key: {
            ticketId: ticketId
        }
    }).promise()
    return ticket
}

exports.handler = async (event, context) => {
    const { ticketId } = event.pathParameters;

    try {
        const ticket = await findTicket(ticketId)

        if(ticket.Item) {
            await db.update({
                TableName: "tickets-db",
                Key: { ticketId: ticketId },
                ReturnValues: 'ALL_NEW',
                UpdateExpression: 'set verified = :true',
                ConditionExpression: 'verified = :false',
                ExpressionAttributeValues: {
                    ':true': true,
                    ':false': false
                }
            }).promise();
            return sendResponse(200, {sucess: true, message: "You ticket is now veriefied"})
        } else {
            return sendResponse(500, { sucess: false, message: "This ticket is not valid"})
    }} 
    catch (err) {
         return sendResponse(500, {sucess: false, message: "This ticket is already verified!"})
    }}
