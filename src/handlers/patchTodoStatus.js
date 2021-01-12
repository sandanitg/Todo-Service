import AWS from 'aws-sdk';
import commonMiddleware from '../lib/commonMiddleware';
import createError from 'http-errors';
import { getTodoById } from './getTodo';

const dynamodb = new AWS.DynamoDB.DocumentClient();

async function patchTodoStatus(event, context){
  const { id } = event.pathParameters;
  const { status } = event.body;

  const todo = await getTodoById(id);

  if(status != "COMPLETED" && status != "INCOMPLETE"){
        throw new createError.Forbidden(`Updated status ${status} is invalid`); 
  }

  const params = {
      TableName: process.env.TODO_TABLE_NAME,
      Key: { id },
      UpdateExpression: 'set #status = :status',
      ExpressionAttributeValues: {
          ':status': status,
      },
      ExpressionAttributeNames: {
          '#status' : 'status',
      },
      ReturnValues: 'ALL_NEW',
  };

  let updatedTodo;

  try{
    const result = await dynamodb.update(params).promise();
    updatedTodo = result.Attributes;
  }catch(error){
    console.error(error);
    throw new createError.InternalServerError(error);
  }

  return {
    statusCode: 200,
    body: JSON.stringify(updatedTodo),
  };
}

  // Use this code if you don't use the http event with the LAMBDA-PROXY integration
  // return { message: 'Go Serverless v1.0! Your function executed successfully!', event };

export const handler = commonMiddleware(patchTodoStatus);

