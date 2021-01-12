import AWS from 'aws-sdk';
import commonMiddleware from '../lib/commonMiddleware';
import createError from 'http-errors';

const dynamodb = new AWS.DynamoDB.DocumentClient();

async function getTodos(event, context){
  // const { status } = event.queryStringParameters;
  const { email } = event.requestContext.authorizer;
  let todos;
  const params ={
    TableName: process.env.TODO_TABLE_NAME,
    FilterExpression:"#user=:user",
    ExpressionAttributeValues: {
      ":user": email,
    },
    ExpressionAttributeNames:{
      "#user":"user"
    }
  }
  // const params = {
  //   TableName: process.env.TODO_TABLE_NAME,
  //   IndexName: 'statusANDcreatedAt',
  //   KeyConditionExpression: '#status = :status',
  //   ExpressionAttributeValues: {
  //     ':status': status,
  //   },
  //   ExpressionAttributeNames: {
  //     '#status': 'status',
  //   },
  // };

  try{
    const result = await dynamodb.scan(params).promise();

    todos = result.Items;
  }catch(error){
    console.error(error);
    throw new createError.InternalServerError(error);
  }

  return {
    statusCode: 200,
    body: JSON.stringify(todos),
  };
}

  // Use this code if you don't use the http event with the LAMBDA-PROXY integration
  // return { message: 'Go Serverless v1.0! Your function executed successfully!', event };

export const handler = commonMiddleware(getTodos);

