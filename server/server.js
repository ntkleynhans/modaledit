const express = require('express');
const { ApolloServer, gql } = require('apollo-server-express');

// Define the GraphQL schema
const typeDefs = gql`
  type Column {
    name: String!
    type: String!
  }

  type TableSchema {
    columns: [Column!]!
  }

  type TableData {
    rows: [[String!]!]!
  }

  input RowInput {
    id: ID!
    data: [String!]!
  }

  type Query {
    tableSchema: TableSchema!
    tableData: TableData!
  }

  type Mutation {
    updateRow(id: ID!, data: RowInput!): Boolean!
  }
`;

// Mock data
const mockSchema = {
  columns: [
    { name: 'id', type: 'ID' },
    { name: 'name', type: 'String' },
    { name: 'email', type: 'String' },
    { name: 'age', type: 'Int' },
  ],
};

let mockData = {
  rows: [
    ['1', 'John Doe', 'john@example.com', '30'],
    ['2', 'Jane Smith', 'jane@example.com', '28'],
    ['3', 'Bob Johnson', 'bob@example.com', '35'],
  ],
};

// Define resolvers
const resolvers = {
  Query: {
    tableSchema: () => mockSchema,
    tableData: () => mockData,
  },
  Mutation: {
    updateRow: (_, { id, data }) => {
      const index = mockData.rows.findIndex(row => row[0] === id);
      if (index !== -1) {
        mockData.rows[index] = [id, ...data.data];
        return true;
      }
      return false;
    },
  },
};

async function startServer() {
  const app = express();
  const server = new ApolloServer({ typeDefs, resolvers });

  await server.start();
  server.applyMiddleware({ app });

  const PORT = 4000;
  app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}${server.graphqlPath}`);
  });
}

startServer().catch(error => {
  console.error('Error starting server:', error);
});

// Example usage of the server
const { request } = require('graphql-request');

async function testQueries() {
  const endpoint = 'http://localhost:4000/graphql';

  try {
    // Test tableSchema query
    const schemaQuery = `
      query {
        tableSchema {
          columns {
            name
            type
          }
        }
      }
    `;
    const schemaResult = await request(endpoint, schemaQuery);
    console.log('Table Schema:', JSON.stringify(schemaResult, null, 2));

    // Test tableData query
    const dataQuery = `
      query {
        tableData {
          rows
        }
      }
    `;
    const dataResult = await request(endpoint, dataQuery);
    console.log('Table Data:', JSON.stringify(dataResult, null, 2));

    // Test updateRow mutation
    const updateMutation = `
      mutation {
        updateRow(id: "2", data: { id: "2", data: ["Jane Doe", "jane.doe@example.com", "29"] })
      }
    `;
    const updateResult = await request(endpoint, updateMutation);
    console.log('Update Result:', JSON.stringify(updateResult, null, 2));

    // Fetch updated data
    const updatedDataResult = await request(endpoint, dataQuery);
    console.log('Updated Table Data:', JSON.stringify(updatedDataResult, null, 2));
  } catch (error) {
    console.error('Error testing queries:', error);
  }
}

// Wait for the server to start before running test queries
setTimeout(testQueries, 2000);