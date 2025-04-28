
import React from 'react';
import { ParkingSlot as ParkingSlotType } from '@/types';
import { cn } from '@/lib/utils';
import { Car, Electric } from 'lucide-react';

interface ParkingSlotProps {
  slot: ParkingSlotType;
  onClick?: () => void;
  selected?: boolean;
  disabled?: boolean;
}

export function ParkingSlot({ slot, onClick, selected, disabled }: ParkingSlotProps) {
  const isAvailable = slot.status === 'available' && !disabled;
  
  const slotClasses = cn(
    'parking-slot',
    isAvailable ? 'parking-slot-available' : 'parking-slot-occupied',
    slot.type === 'electric' && 'parking-slot-electric',
    selected && 'ring-2 ring-parking-highlight',
    onClick && isAvailable && 'cursor-pointer'
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
            <Electric className="h-5 w-5" />
          )}
          <span className="text-sm font-medium">
            {isAvailable ? 'Available' : 'Occupied'}
          </span>
        </div>
      </div>
    </div>
  );
}
