
import React from 'react';
import { ParkingSlot as ParkingSlotType } from '@/types';
import { cn } from '@/lib/utils';
import { Car, Zap } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface ParkingSlotProps {
  slot: ParkingSlotType;
  onClick?: () => void;
  selected?: boolean;
  disabled?: boolean;
}

export function ParkingSlot({ slot, onClick, selected, disabled }: ParkingSlotProps) {
  const isAvailable = slot.status === 'available' && !disabled;
  
  const slotClasses = cn(
    'parking-slot relative rounded-lg border p-4 transition-all',
    isAvailable 
      ? 'bg-[#F2FCE2] border-green-300 hover:border-green-500 text-green-800' // Green for available slots
      : 'bg-red-100 border-red-300 text-red-800', // Brighter red for booked/occupied slots
    slot.type === 'electric' && 'border-l-4 border-l-blue-500',
    selected && 'ring-2 ring-blue-500 ring-offset-2',
    onClick && isAvailable && 'cursor-pointer hover:shadow-md'
  );
  
  return (
    <div 
      className={slotClasses}
      onClick={isAvailable && onClick ? onClick : undefined}
      role={isAvailable && onClick ? "button" : undefined}
      tabIndex={isAvailable && onClick ? 0 : undefined}
    >
      <div className="flex flex-col items-center justify-center">
        <div className="text-lg font-bold mb-1">{slot.name}</div>
        <div className="flex items-center gap-1">
          {slot.type === 'normal' ? (
            <Car className="h-5 w-5" />
          ) : (
            <Zap className="h-5 w-5" />
          )}
          <Badge 
            variant={isAvailable ? "success" : "destructive"}
            className="text-xs"
          >
            {isAvailable ? 'Available' : 'Occupied'}
          </Badge>
        </div>
      </div>
    </div>
  );
}
