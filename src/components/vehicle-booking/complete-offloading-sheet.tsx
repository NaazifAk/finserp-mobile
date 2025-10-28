"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Truck, Clock, Package, AlertTriangle } from "lucide-react"
import type { VehicleBooking, CompleteOffloadingRequest } from "@/types/vehicle-booking"

interface CompleteOffloadingSheetProps {
  booking: VehicleBooking | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (booking: VehicleBooking, data: CompleteOffloadingRequest) => void
  loading?: boolean
}

export function CompleteOffloadingSheet({
  booking,
  open,
  onOpenChange,
  onSubmit,
  loading = false,
}: CompleteOffloadingSheetProps) {
  const t = useTranslations('vehicleBookings.completeOffloading')
  const [actualBoxCount, setActualBoxCount] = useState("")
  const [notes, setNotes] = useState("")
  const [error, setError] = useState("")

  const handleSubmit = () => {
    if (!booking) return

    const boxCount = parseInt(actualBoxCount)

    if (!actualBoxCount.trim() || isNaN(boxCount) || boxCount <= 0) {
      setError(t('validation.boxCountRequired'))
      return
    }

    setError("")
    onSubmit(booking, {
      actual_box_count: boxCount,
      notes: notes.trim() || undefined,
    })

    setActualBoxCount("")
    setNotes("")
    onOpenChange(false)
  }

  const handleClose = () => {
    setActualBoxCount("")
    setNotes("")
    setError("")
    onOpenChange(false)
  }

  const handleBoxCountChange = (value: string) => {
    setActualBoxCount(value)
    if (error) setError("")
  }

  const boxCountDiff = booking && actualBoxCount ?
    parseInt(actualBoxCount) - booking.box_count : 0

  if (!booking) return null

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="max-h-[80dvh] flex flex-col">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Truck className="size-5" />
            {t('title')}
          </SheetTitle>
          <SheetDescription>
            {t('description')}
          </SheetDescription>
        </SheetHeader>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-4 pb-4">
          <div className="mt-6 space-y-4">
            {/* Vehicle Info */}
            <div className="bg-muted/50 rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold">{booking.vehicle_number}</h4>
                <span className="text-sm text-muted-foreground">
                  ID: {booking.id}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Package className="size-4 text-muted-foreground" />
                  <span>{booking.box_count} boxes (expected)</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="size-4 text-muted-foreground" />
                  <span>{Number(booking.weight_tons || 0).toFixed(2)} tons</span>
                </div>
              </div>

              {booking.offloading_started_at && (
                <div className="text-sm text-muted-foreground">
                  Started: {new Date(booking.offloading_started_at).toLocaleString()}
                </div>
              )}
            </div>

            {/* Actual Box Count */}
            <div className="space-y-2">
              <Label htmlFor="actual-box-count" className="text-base font-medium">
                {t('actualBoxCount.label')} *
              </Label>
              <Input
                id="actual-box-count"
                type="number"
                value={actualBoxCount}
                onChange={(e) => handleBoxCountChange(e.target.value)}
                placeholder={t('actualBoxCount.placeholder')}
                disabled={loading}
                className={error ? "border-red-500" : ""}
              />
              {error && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  <AlertTriangle className="size-4" />
                  {error}
                </p>
              )}
              {actualBoxCount && !error && boxCountDiff !== 0 && (
                <p className={`text-sm flex items-center gap-1 ${
                  boxCountDiff > 0 ? "text-green-600" : "text-orange-600"
                }`}>
                  <Package className="size-4" />
                  {boxCountDiff > 0 ? "+" : ""}{boxCountDiff} boxes difference
                </p>
              )}
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">{t('notes.label')}</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={t('notes.placeholder')}
                rows={3}
                disabled={loading}
              />
              <p className="text-xs text-muted-foreground">
                {t('notes.description')}
              </p>
            </div>
          </div>
        </div>

        {/* Fixed Actions Footer */}
        <div className="flex-shrink-0 border-t bg-background p-4">
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={loading}
              className="flex-1"
            >
              {t('actions.cancel')}
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={loading}
              className="flex-1"
            >
              {loading ? t('actions.completing') : t('actions.complete')}
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}