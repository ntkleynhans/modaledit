'use client'

import { useState } from 'react'
import { useQuery, useMutation, gql } from '@apollo/client'
import { Button } from "./components/ui/button"

const GET_TABLE_DATA = gql`
  query GetTableData {
    tableData {
      rows
    }
  }
`

const UPDATE_ROW_DATA = gql`
  mutation UpdateRowData($id: ID!, $data: RowInput!) {
    updateRow(id: $id, data: $data) {
      id
      # Add other fields that are returned after update
    }
  }
`

export default function Table({ schema, EditModal }) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingRow, setEditingRow] = useState(null)

  const { loading, error, data, refetch } = useQuery(GET_TABLE_DATA)
  const [updateRow] = useMutation(UPDATE_ROW_DATA)

  if (loading) return <p>Loading data...</p>
  if (error) return <p>Error loading data: {error.message}</p>

  const mergedData = mergeSchemaAndData(schema, data.tableData.rows)

  const handleEdit = (row) => {
    setEditingRow(row)
    setIsModalOpen(true)
  }

  const handleUpdate = async (updatedData) => {
    try {
      await updateRow({
        variables: {
          id: editingRow.id,
          data: updatedData
        }
      })
      // Refetch the data to update the table
      await refetch()
      setIsModalOpen(false)
      setEditingRow(null)
    } catch (error) {
      console.error('Error updating row:', error)
    }
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white border border-gray-300">
        <thead>
          <tr className="bg-gray-100">
            {schema.map((column) => (
              <th key={column.name} className="px-4 py-2 text-left border-b">
                {column.name}
              </th>
            ))}
            <th className="px-4 py-2 text-left border-b">Actions</th>
          </tr>
        </thead>
        <tbody>
          {mergedData.map((row, index) => (
            <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
              {schema.map((column) => (
                <td key={column.name} className="px-4 py-2 border-b">
                  {row[column.name]}
                </td>
              ))}
              <td className="px-4 py-2 border-b">
                <Button onClick={() => handleEdit(row)}>Edit</Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <EditModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onUpdate={handleUpdate}
        row={editingRow}
        schema={schema}
      />
    </div>
  )
}

function mergeSchemaAndData(schema, rows) {
  return rows.map((row) => {
    const mergedRow = {}
    schema.forEach((column, index) => {
      mergedRow[column.name] = row[index]
    })
    return mergedRow
  })
}