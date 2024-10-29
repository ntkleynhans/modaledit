'use client'

import { ApolloClient, InMemoryCache, ApolloProvider, useQuery, gql } from '@apollo/client'
import Table from './Table'
import EditModal from './EditModal'

const client = new ApolloClient({
  uri: 'http://localhost:4000/graphql',
  cache: new InMemoryCache(),
})

const GET_TABLE_SCHEMA = gql`
  query GetTableSchema {
    tableSchema {
      columns {
        name
        type
      }
    }
  }
`

export default function App() {
  return (
    <ApolloProvider client={client}>
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">GraphQL Table App</h1>
        <TableWrapper />
      </div>
    </ApolloProvider>
  )
}

function TableWrapper() {
  const { loading, error, data } = useQuery(GET_TABLE_SCHEMA)

  if (loading) return <p>Loading schema...</p>
  if (error) return <p>Error loading schema: {error.message}</p>

  return <Table schema={data.tableSchema.columns} EditModal={EditModal} />
}