'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "./components/ui/dialog"
import { Button } from "./components/ui/button"
import { Input } from "./components/ui/input"
import { Label } from "./components/ui/label"

export default function EditModal({ isOpen, onClose, onUpdate, row, schema }) {
  const [formData, setFormData] = useState({})

  useEffect(() => {
    if (row) {
      setFormData(row)
    }
  }, [row])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onUpdate(formData)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Row</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            {schema.map((column) => (
              <div key={column.name} className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor={column.name} className="text-right">
                  {column.name}
                </Label>
                <Input
                  id={column.name}
                  name={column.name}
                  value={formData[column.name] || ''}
                  onChange={handleInputChange}
                  className="col-span-3"
                />
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button type="submit">Save changes</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}