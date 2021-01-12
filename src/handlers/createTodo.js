import { v4 as uuid } from 'uuid';
import AWS from 'aws-sdk';
import commonMiddleware from '../lib/commonMiddleware';
import createError from 'http-errors';

const dynamodb = new AWS.DynamoDB.DocumentClient();

async function createTodo(event, context){
  const { email } = event.requestContext.authorizer;
  const {title} = event.body;
  const now = new Date();

  const todo = {
    id: uuid(),
    user: email,
    status: 'INCOMPLETE',
    title: title,
    createdAt: now.toISOString(),
  };

  try{
    await dynamodb.put({
      TableName: process.env.TODO_TABLE_NAME,
      Item: todo,
    }).promise();
  }catch(error){
    console.error(error);
    throw new createError.InternalServerError(error);
  }

  return {
    statusCode: 201,
    body: JSON.stringify(todo),
  };
}

  // Use this code if you don't use the http event with the LAMBDA-PROXY integration
  // return { message: 'Go Serverless v1.0! Your function executed successfully!', event };

export const handler = commonMiddleware(createTodo);

