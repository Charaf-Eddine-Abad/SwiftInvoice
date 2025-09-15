'use client'

import { useState, useEffect } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { invoiceSchema, InvoiceFormInput } from '@/lib/validations'

interface Client {
  id: string
  name: string
  companyName?: string
}

interface InvoiceFormProps {
  invoice?: InvoiceFormInput & { id?: string }
  clients: Client[]
  onSubmit: (data: InvoiceFormInput) => Promise<void>
  onCancel: () => void
}

export default function InvoiceForm({ invoice, clients, onSubmit, onCancel }: InvoiceFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [defaultValues, setDefaultValues] = useState({
    tax: 0,
    discount: 0
  })
  
  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors },
    reset,
    setValue,
  } = useForm<InvoiceFormInput>({
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

  // Load user's default preferences
  useEffect(() => {
    const loadDefaults = async () => {
      try {
        const response = await fetch('/api/user-preferences')
        if (response.ok) {
          const data = await response.json()
          const preferences = data.preferences
          setDefaultValues({
            tax: preferences.defaultTaxRate || 0,
            discount: preferences.defaultDiscount || 0
          })
          
          // If this is a new invoice (not editing), set the default values
          if (!invoice) {
            setValue('tax', preferences.defaultTaxRate || 0)
            setValue('discount', preferences.defaultDiscount || 0)
          }
        }
      } catch (error) {
        console.error('Error loading default preferences:', error)
      }
    }
    loadDefaults()
  }, [invoice, setValue])

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

  const handleFormSubmit = async (data: InvoiceFormInput) => {
    try {
      setIsSubmitting(true)
      // Ensure tax and discount are numbers, not undefined
      const formData = {
        ...data,
        tax: data.tax || 0,
        discount: data.discount || 0
      }
      await onSubmit(formData)
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
          <label htmlFor="clientId" className="block text-sm font-medium text-foreground">
            Client *
          </label>
          <select
            id="clientId"
            {...register('clientId')}
            className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="">Select a client</option>
            {clients.map((client) => (
              <option key={client.id} value={client.id}>
                {client.name} {client.companyName ? `(${client.companyName})` : ''}
              </option>
            ))}
          </select>
          {errors.clientId && (
            <p className="mt-1 text-sm text-destructive">{errors.clientId.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="issueDate" className="block text-sm font-medium text-foreground">
            Issue Date *
          </label>
          <input
            type="date"
            id="issueDate"
            {...register('issueDate')}
            className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          />
          {errors.issueDate && (
            <p className="mt-1 text-sm text-destructive">{errors.issueDate.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="dueDate" className="block text-sm font-medium text-foreground">
            Due Date *
          </label>
          <input
            type="date"
            id="dueDate"
            {...register('dueDate')}
            className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          />
          {errors.dueDate && (
            <p className="mt-1 text-sm text-destructive">{errors.dueDate.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="tax" className="block text-sm font-medium text-foreground">
            Tax Rate (%)
          </label>
          <input
            type="number"
            id="tax"
            step="0.01"
            min="0"
            {...register('tax', { valueAsNumber: true })}
            className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          />
        </div>

        <div>
          <label htmlFor="discount" className="block text-sm font-medium text-foreground">
            Discount Amount
          </label>
          <input
            type="number"
            id="discount"
            step="0.01"
            min="0"
            {...register('discount', { valueAsNumber: true })}
            className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          />
        </div>
      </div>

      {/* Invoice Items */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-foreground">Invoice Items</h3>
          <button
            type="button"
            onClick={addItem}
            className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-3"
          >
            Add Item
          </button>
        </div>

        <div className="space-y-4">
          {fields.map((field, index) => (
            <div key={field.id} className="grid grid-cols-12 gap-4 items-end border border-border p-4 rounded-lg">
              <div className="col-span-6">
                <label className="block text-sm font-medium text-foreground">
                  Description *
                </label>
                <input
                  type="text"
                  {...register(`items.${index}.description` as const)}
                  className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>
              
              <div className="col-span-2">
                <label className="block text-sm font-medium text-foreground">
                  Quantity *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  {...register(`items.${index}.quantity` as const, { valueAsNumber: true })}
                  className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>
              
              <div className="col-span-2">
                <label className="block text-sm font-medium text-foreground">
                  Unit Price *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  {...register(`items.${index}.unitPrice` as const, { valueAsNumber: true })}
                  className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>
              
              <div className="col-span-1">
                <label className="block text-sm font-medium text-foreground">
                  Total
                </label>
                <div className="mt-1 text-sm text-foreground font-medium">
                  ${((watchedItems?.[index]?.quantity || 0) * (watchedItems?.[index]?.unitPrice || 0)).toFixed(2)}
                </div>
              </div>
              
              <div className="col-span-1">
                <button
                  type="button"
                  onClick={() => removeItem(index)}
                  disabled={fields.length === 1}
                  className="text-destructive hover:text-destructive/80 disabled:opacity-50"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>

        {errors.items && (
          <p className="mt-1 text-sm text-destructive">{errors.items.message}</p>
        )}
      </div>

      {/* Totals */}
      <div className="bg-muted p-4 rounded-lg">
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Subtotal:</span>
            <span className="text-sm font-medium text-foreground">${subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Tax ({watchedTax || 0}%):</span>
            <span className="text-sm font-medium text-foreground">${taxAmount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Discount:</span>
            <span className="text-sm font-medium text-foreground">${(watchedDiscount || 0).toFixed(2)}</span>
          </div>
          <div className="border-t border-border pt-2">
            <div className="flex justify-between">
              <span className="text-lg font-bold text-foreground">Total:</span>
              <span className="text-lg font-bold text-foreground">${finalTotal.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={onCancel}
          className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
        >
          {isSubmitting ? 'Saving...' : invoice ? 'Update Invoice' : 'Create Invoice'}
        </button>
      </div>
    </form>
  )
}