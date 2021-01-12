import AWS from 'aws-sdk';
import commonMiddleware from '../lib/commonMiddleware';
import createError from 'http-errors';

const dynamodb = new AWS.DynamoDB.DocumentClient();

export async function getTodoById(id){
  let todo;

  try{
    const result = await dynamodb.get({
      TableName: process.env.TODO_TABLE_NAME,
      Key: { id }
    }).promise();

    todo = result.Item;
  }catch(error){
    console.error(error);
    throw new createError.InternalServerError(error);
  }

  if(!todo){
      throw new createError.NotFound(`Auction with ID "${id}" not found`);
  }

  return todo;
}

async function getTodo(event, context){
  const { id } = event.pathParameters;
  const todo = await getTodoById(id);

  return {
    statusCode: 200,
    body: JSON.stringify(todo),
  };
}

  // Use this code if you don't use the http event with the LAMBDA-PROXY integration
  // return { message: 'Go Serverless v1.0! Your function executed successfully!', event };

export const handler = commonMiddleware(getTodo);

