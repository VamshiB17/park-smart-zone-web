
import React from 'react';
import { ParkingSlot as ParkingSlotType } from '@/types';
import { ParkingSlot } from './ParkingSlot';

interface SlotGridProps {
  slots: ParkingSlotType[];
  onSlotClick?: (slotId: string) => void;
  selectedSlotId?: string;
  filterType?: 'all' | 'normal' | 'electric';
  disabledSlots?: string[];
}

export function SlotGrid({ 
  slots, 
  onSlotClick, 
  selectedSlotId,
  filterType = 'all',
  disabledSlots = []
}: SlotGridProps) {
  // Filter slots based on type
  const filteredSlots = filterType === 'all' 
    ? slots 
    : slots.filter(slot => slot.type === filterType);
  
  // Group slots by floor
  const slotsByFloor = filteredSlots.reduce<Record<number, ParkingSlotType[]>>(
    (acc, slot) => {
      if (!acc[slot.floor]) {
        acc[slot.floor] = [];
      }
      acc[slot.floor].push(slot);
      return acc;
    }, 
    {}
  );
  
  // Sort floors
  const floors = Object.keys(slotsByFloor).map(Number).sort();
  
  return (
    <div className="space-y-8">
      {floors.map(floor => (
        <div key={floor} className="space-y-3">
          <h3 className="text-lg font-semibold">Floor {floor}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {slotsByFloor[floor].map((slot) => (
              <ParkingSlot 
                key={slot.id} 
                slot={slot} 
                onClick={onSlotClick ? () => onSlotClick(slot.id) : undefined}
                selected={selectedSlotId === slot.id}
                disabled={disabledSlots.includes(slot.id)}
              />
            ))}
          </div>
        </div>
      ))}
      
      {floors.length === 0 && (
        <div className="text-center py-10">
          <p className="text-lg text-gray-500">No parking slots available for the selected filter.</p>
        </div>
      )}
    </div>
  );
}
