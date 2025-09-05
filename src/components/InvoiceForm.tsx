'use client'

import { useState, useEffect } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { invoiceSchema, InvoiceInput, InvoiceItemInput } from '@/lib/validations'

interface Client {
  id: string
  name: string
  companyName?: string
}

interface InvoiceFormProps {
  invoice?: InvoiceInput & { id?: string }
  clients: Client[]
  onSubmit: (data: InvoiceInput) => Promise<void>
  onCancel: () => void
}

export default function InvoiceForm({ invoice, clients, onSubmit, onCancel }: InvoiceFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors },
    reset,
    setValue
  } = useForm<InvoiceInput>({
    resolver: zodResolver(invoiceSchema),
    defaultValues: invoice || {
      clientId: '',
      issueDate: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      tax: 0,
      discount: 0,
      items: [{ description: '', quantity: 1, unitPrice: 0 }]
    }
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'items'
  })

  const watchedItems = watch('items')
  const watchedTax = watch('tax')
  const watchedDiscount = watch('discount')

  // Calculate totals
  const subtotal = watchedItems?.reduce((sum, item) => {
    return sum + (item.quantity || 0) * (item.unitPrice || 0)
  }, 0) || 0

  const taxAmount = (subtotal * (watchedTax || 0)) / 100
  const finalTotal = subtotal + taxAmount - (watchedDiscount || 0)

  const handleFormSubmit = async (data: InvoiceInput) => {
    try {
      setIsSubmitting(true)
      await onSubmit(data)
      reset()
    } catch (error) {
      console.error('Error submitting form:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const addItem = () => {
    append({ description: '', quantity: 1, unitPrice: 0 })
  }

  const removeItem = (index: number) => {
    if (fields.length > 1) {
      remove(index)
    }
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="clientId" className="block text-sm font-medium text-gray-700">
            Client *
          </label>
          <select
            id="clientId"
            {...register('clientId')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          >
            <option value="">Select a client</option>
            {clients.map((client) => (
              <option key={client.id} value={client.id}>
                {client.name} {client.companyName ? `(${client.companyName})` : ''}
              </option>
            ))}
          </select>
          {errors.clientId && (
            <p className="mt-1 text-sm text-red-600">{errors.clientId.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="issueDate" className="block text-sm font-medium text-gray-700">
            Issue Date *
          </label>
          <input
            type="date"
            id="issueDate"
            {...register('issueDate')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          />
          {errors.issueDate && (
            <p className="mt-1 text-sm text-red-600">{errors.issueDate.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700">
            Due Date *
          </label>
          <input
            type="date"
            id="dueDate"
            {...register('dueDate')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          />
          {errors.dueDate && (
            <p className="mt-1 text-sm text-red-600">{errors.dueDate.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="tax" className="block text-sm font-medium text-gray-700">
            Tax Rate (%)
          </label>
          <input
            type="number"
            id="tax"
            step="0.01"
            min="0"
            {...register('tax', { valueAsNumber: true })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          />
        </div>

        <div>
          <label htmlFor="discount" className="block text-sm font-medium text-gray-700">
            Discount Amount
          </label>
          <input
            type="number"
            id="discount"
            step="0.01"
            min="0"
            {...register('discount', { valueAsNumber: true })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          />
        </div>
      </div>

      {/* Invoice Items */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">Invoice Items</h3>
          <button
            type="button"
            onClick={addItem}
            className="px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Add Item
          </button>
        </div>

        <div className="space-y-4">
          {fields.map((field, index) => (
            <div key={field.id} className="grid grid-cols-12 gap-4 items-end border p-4 rounded-lg">
              <div className="col-span-6">
                <label className="block text-sm font-medium text-gray-700">
                  Description *
                </label>
                <input
                  type="text"
                  {...register(`items.${index}.description` as const)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                />
              </div>
              
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700">
                  Quantity *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  {...register(`items.${index}.quantity` as const, { valueAsNumber: true })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                />
              </div>
              
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700">
                  Unit Price *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  {...register(`items.${index}.unitPrice` as const, { valueAsNumber: true })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                />
              </div>
              
              <div className="col-span-1">
                <label className="block text-sm font-medium text-gray-700">
                  Total
                </label>
                <div className="mt-1 text-sm text-gray-900 font-medium">
                  ${((watchedItems?.[index]?.quantity || 0) * (watchedItems?.[index]?.unitPrice || 0)).toFixed(2)}
                </div>
              </div>
              
              <div className="col-span-1">
                <button
                  type="button"
                  onClick={() => removeItem(index)}
                  disabled={fields.length === 1}
                  className="text-red-600 hover:text-red-800 disabled:opacity-50"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>

        {errors.items && (
          <p className="mt-1 text-sm text-red-600">{errors.items.message}</p>
        )}
      </div>

      {/* Totals */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">Subtotal:</span>
            <span className="text-sm font-medium">${subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">Tax ({watchedTax || 0}%):</span>
            <span className="text-sm font-medium">${taxAmount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">Discount:</span>
            <span className="text-sm font-medium">${(watchedDiscount || 0).toFixed(2)}</span>
          </div>
          <div className="border-t pt-2">
            <div className="flex justify-between">
              <span className="text-lg font-bold text-gray-900">Total:</span>
              <span className="text-lg font-bold text-gray-900">${finalTotal.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {isSubmitting ? 'Saving...' : invoice ? 'Update Invoice' : 'Create Invoice'}
        </button>
      </div>
    </form>
  )
}

