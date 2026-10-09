import React, { useState } from 'react';
import { VehicleTopView, VehicleZone } from './VehicleTopView';
import { VEICULOS_INICIAIS } from '../data/mockData';
import { Colaborador } from '../types';

export const ComponentShowcase: React.FC = () => {
  const [selectedZone, setSelectedZone] = useState<VehicleZone | null>(null);
  const sampleVehicle = VEICULOS_INICIAIS[0];

  const handleAssentoClick = (posicao: VehicleZone, colaborador: Colaborador) => {
    setSelectedZone(posicao);
  };

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <div className="bg-card border border-border rounded-2xl p-6 shadow-xl">
        <h2 className="text-lg font-bold text-foreground mb-4">Visualização Top-View do Veículo</h2>
        {sampleVehicle && (
          <VehicleTopView
            veiculo={sampleVehicle}
            onAssentoClick={handleAssentoClick}
            selectedZone={selectedZone}
          />
        )}
      </div>
    </div>
  );
};