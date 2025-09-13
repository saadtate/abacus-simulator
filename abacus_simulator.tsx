import React, { useState, useCallback } from 'react';

const abacusTypes = [
  {
    id: 'babylonian',
    name: 'Abacus Babylonien',
    period: '~3000 av. J.-C. – Mésopotamie',
    description: 'Tablettes d\'argile avec cases et jetons',
    function: 'Comptage en base 60 (commerce, astronomie)',
    columns: 6,
    tokensPerColumn: 59, // 0-59
    base: 60,
    color: '#8B4513'
  },
  {
    id: 'egyptian',
    name: 'Tablettes de Calcul',
    period: '~2000 av. J.-C. – Égypte',
    description: 'Surface plane, jetons déplacés sur colonnes',
    function: 'Comptabilité et impôts',
    columns: 5,
    tokensPerColumn: 9, // 0-9
    base: 10,
    color: '#DAA520'
  },
  {
    id: 'greek',
    name: 'Abax Grec',
    period: '~500 av. J.-C. – Grèce',
    description: 'Planche quadrillée, jetons mobiles',
    function: 'Calculs arithmétiques, enseignement',
    columns: 7,
    tokensPerColumn: 9, // 0-9
    base: 10,
    color: '#4682B4'
  },
  {
    id: 'roman',
    name: 'Calculi Romain',
    period: 'Ier s. apr. J.-C. – Rome',
    description: 'Table portative à rainures et galets métalliques',
    function: 'Commerce, administration',
    columns: 6,
    tokensPerColumn: 9, // 0-9
    base: 10,
    color: '#8B0000'
  },
  {
    id: 'chinese_early',
    name: 'Suanpan (Précurseur)',
    period: '~200 av. J.-C. – Chine',
    description: 'Cadre en bois, tiges avec boules coulissantes',
    function: 'Calculs de base',
    columns: 8,
    hasBeads: true,
    upperBeads: 2,
    lowerBeads: 5,
    base: 10,
    color: '#654321'
  },
  {
    id: 'suanpan',
    name: 'Suanpan Classique',
    period: '~XIVe siècle – Chine',
    description: '2 boules supérieures + 5 inférieures par tige',
    function: 'Additions, multiplications, divisions, racines',
    columns: 13,
    hasBeads: true,
    upperBeads: 2,
    lowerBeads: 5,
    base: 10,
    color: '#8B4513'
  },
  {
    id: 'soroban',
    name: 'Soroban',
    period: 'XVIIe siècle – Japon',
    description: '1 boule supérieure + 4 inférieures par tige',
    function: 'Simplification et rapidité des calculs',
    columns: 15,
    hasBeads: true,
    upperBeads: 1,
    lowerBeads: 4,
    base: 10,
    color: '#2F4F4F'
  }
];

const AbacusSimulator = () => {
  const [selectedType, setSelectedType] = useState(abacusTypes[0]);
  const [abacusState, setAbacusState] = useState({});
  const [currentValue, setCurrentValue] = useState(0);
  const [showInfo, setShowInfo] = useState(true);
  const [carryOperations, setCarryOperations] = useState([]);

  // Helper pour créer des états compacts de perles
  const createCompactBeads = (count, maxBeads) => {
    const arr = Array(maxBeads).fill(false);
    for (let i = 0; i < Math.min(count, maxBeads); i++) {
      arr[i] = true;
    }
    return arr;
  };

  // Helper pour normaliser avec retenues (jetons)
  const normalizeWithCarry = (state, type) => {
    const newState = { ...state };
    const operations = [];
    
    // Propagation des retenues de droite à gauche
    for (let col = type.columns - 1; col >= 0; col--) {
      let value = newState[col] || 0;
      if (value >= type.base) {
        const carry = Math.floor(value / type.base);
        const remainder = value % type.base;
        
        operations.push({
          column: col,
          oldValue: value,
          newValue: remainder,
          carry: carry,
          carryTo: col - 1
        });
        
        newState[col] = remainder;
        if (col > 0) {
          newState[col - 1] = (newState[col - 1] || 0) + carry;
        }
      }
    }
    
    // Éviter les valeurs négatives
    for (let col = 0; col < type.columns; col++) {
      newState[col] = Math.max(0, newState[col] || 0);
    }
    
    setCarryOperations(operations);
    return newState;
  };

  // Initialiser l'état de l'abacus
  const initializeAbacus = useCallback((type) => {
    const state = {};
    if (type.hasBeads) {
      for (let i = 0; i < type.columns; i++) {
        state[i] = {
          upper: Array(type.upperBeads).fill(false),
          lower: Array(type.lowerBeads).fill(false)
        };
      }
    } else {
      for (let i = 0; i < type.columns; i++) {
        state[i] = 0;
      }
    }
    setAbacusState(state);
    setCurrentValue(0);
    setCarryOperations([]);
  }, []);

  // Changer le type d'abacus
  const handleTypeChange = (type) => {
    setSelectedType(type);
    initializeAbacus(type);
  };

  // Calculer la valeur actuelle
  const calculateValue = useCallback(() => {
    let total = 0;
    const type = selectedType;
    
    if (type.hasBeads) {
      for (let col = 0; col < type.columns; col++) {
        const column = abacusState[col];
        if (column) {
          // Valeur brute de la colonne
          let columnDigit = column.upper.filter(Boolean).length * 5 +
                           column.lower.filter(Boolean).length * 1;
          
          const pos = type.columns - 1 - col;
          
          if (type.id === 'suanpan' || type.id === 'chinese_early') {
            // Pour le suanpan, gérer le portage automatique en base 10
            const carry = Math.floor(columnDigit / 10);
            columnDigit = columnDigit % 10;
            total += columnDigit * Math.pow(type.base, pos);
            if (carry > 0) {
              total += carry * Math.pow(type.base, pos + 1);
            }
          } else {
            // Soroban et autres : état strict 0-9
            total += columnDigit * Math.pow(type.base, pos);
          }
        }
      }
    } else {
      for (let col = 0; col < type.columns; col++) {
        const tokens = abacusState[col] || 0;
        const pos = type.columns - 1 - col;
        total += tokens * Math.pow(type.base, pos);
      }
    }
    
    setCurrentValue(total);
  }, [abacusState, selectedType]);

  // Manipuler les perles avec états compacts
  const toggleBead = (column, section, index) => {
    const type = selectedType;
    const current = abacusState[column][section];
    const currentCount = current.filter(Boolean).length;
    
    // Calculer le nouveau nombre de perles actives
    let newCount;
    if (current[index]) {
      // Désactiver une perle : réduire le compte
      newCount = Math.max(0, currentCount - 1);
    } else {
      // Activer une perle : augmenter le compte
      newCount = currentCount + 1;
    }
    
    // Limites spécifiques par type
    const maxAllowed = section === 'upper' 
      ? (type.id === 'soroban' ? 1 : type.upperBeads)
      : (type.id === 'soroban' ? 4 : type.lowerBeads);
    
    newCount = Math.max(0, Math.min(maxAllowed, newCount));
    
    // Créer l'état compact
    const newState = { ...abacusState };
    newState[column] = { ...newState[column] };
    newState[column][section] = createCompactBeads(newCount, 
      section === 'upper' ? type.upperBeads : type.lowerBeads);
    
    setAbacusState(newState);
  };

  // Manipuler les jetons avec retenues automatiques
  const adjustTokens = (column, delta) => {
    const type = selectedType;
    const newState = { ...abacusState };
    const current = newState[column] || 0;
    let next = current + delta;
    
    // Permet temporairement de dépasser pour déclencher le portage
    next = Math.max(0, next);
    newState[column] = next;

    // Appliquer le portage en base
    const carried = normalizeWithCarry(newState, type);
    setAbacusState(carried);
  };

  // Réinitialiser
  const reset = () => {
    initializeAbacus(selectedType);
  };

  // Initialiser au montage
  React.useEffect(() => {
    initializeAbacus(selectedType);
  }, [selectedType, initializeAbacus]);

  // Recalculer la valeur quand l'état change
  React.useEffect(() => {
    calculateValue();
  }, [calculateValue]);

  const renderBeadAbacus = () => {
    const type = selectedType;
    return (
      <div className="bg-gradient-to-b from-amber-100 to-amber-200 p-8 rounded-xl border-4 border-amber-800 shadow-2xl">
        <div className="bg-amber-900 h-2 rounded mb-4"></div>
        
        <div className="flex justify-center space-x-2">
          {Array.from({ length: type.columns }, (_, col) => {
            const columnValue = (abacusState[col]?.upper.filter(Boolean).length || 0) * 5 +
                               (abacusState[col]?.lower.filter(Boolean).length || 0) * 1;
            
            return (
              <div key={col} className="flex flex-col items-center">
                {/* Section supérieure */}
                <div className="bg-amber-800 h-24 w-1 rounded mb-2 relative">
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 space-y-1">
                    {Array.from({ length: type.upperBeads }, (_, i) => (
                      <div
                        key={i}
                        className={`w-4 h-4 rounded-full cursor-pointer transition-all duration-200 ${
                          abacusState[col]?.upper[i] 
                            ? 'bg-red-600 shadow-lg transform scale-110' 
                            : 'bg-red-300 hover:bg-red-400'
                        }`}
                        onClick={() => toggleBead(col, 'upper', i)}
                      />
                    ))}
                  </div>
                </div>

                {/* Séparateur */}
                <div className="bg-amber-900 h-1 w-6 rounded"></div>

                {/* Section inférieure */}
                <div className="bg-amber-800 h-24 w-1 rounded mt-2 relative">
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 space-y-1">
                    {Array.from({ length: type.lowerBeads }, (_, i) => (
                      <div
                        key={i}
                        className={`w-4 h-4 rounded-full cursor-pointer transition-all duration-200 ${
                          abacusState[col]?.lower[i] 
                            ? 'bg-blue-600 shadow-lg transform scale-110' 
                            : 'bg-blue-300 hover:bg-blue-400'
                        }`}
                        onClick={() => toggleBead(col, 'lower', i)}
                      />
                    ))}
                  </div>
                </div>

                {/* Indicateur de colonne et valeur */}
                <div className="text-xs mt-2 text-amber-800 font-bold text-center">
                  <div>{Math.pow(type.base, type.columns - 1 - col)}</div>
                  <div className="text-amber-600">({columnValue})</div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="bg-amber-900 h-2 rounded mt-4"></div>
      </div>
    );
  };

  const renderTokenAbacus = () => {
    const type = selectedType;
    return (
      <div 
        className="p-8 rounded-xl border-4 shadow-2xl"
        style={{ 
          backgroundColor: `${type.color}20`,
          borderColor: type.color 
        }}
      >
        <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${type.columns}, 1fr)` }}>
          {Array.from({ length: type.columns }, (_, col) => {
            const power = Math.pow(type.base, type.columns - 1 - col);
            const powerLabel = type.base === 60 ? `60^${type.columns - 1 - col}` : power;
            
            return (
              <div key={col} className="flex flex-col items-center">
                <div className="text-xs mb-2 font-bold text-center" style={{ color: type.color }}>
                  <div>{powerLabel}</div>
                  {type.base === 60 && <div className="text-gray-600">({power})</div>}
                </div>
                
                <div 
                  className="w-16 h-32 rounded-lg border-2 flex flex-col-reverse items-center justify-start p-2 relative"
                  style={{ borderColor: type.color, backgroundColor: `${type.color}10` }}
                >
                  {/* Jetons */}
                  {Array.from({ length: abacusState[col] || 0 }, (_, i) => (
                    <div
                      key={i}
                      className="w-3 h-3 rounded-full mb-1 shadow-sm"
                      style={{ backgroundColor: type.color }}
                    />
                  ))}
                  
                  {/* Contrôles */}
                  <div className="absolute -right-8 top-1/2 transform -translate-y-1/2 flex flex-col space-y-1">
                    <button
                      onClick={() => adjustTokens(col, 1)}
                      className="w-6 h-6 rounded text-xs font-bold text-white hover:opacity-80 transition-opacity"
                      style={{ backgroundColor: type.color }}
                    >
                      +
                    </button>
                    <button
                      onClick={() => adjustTokens(col, -1)}
                      className="w-6 h-6 rounded text-xs font-bold text-white hover:opacity-80 transition-opacity"
                      style={{ backgroundColor: type.color }}
                    >
                      -
                    </button>
                  </div>
                </div>
                
                <div className="text-xs mt-2 font-bold" style={{ color: type.color }}>
                  {abacusState[col] || 0}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto p-6 bg-gradient-to-br from-amber-50 to-orange-50 min-h-screen">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-amber-900 mb-2">
          Simulateur d'Abacus Historique
        </h1>
        <p className="text-amber-700">
          Explorez les systèmes de calcul à travers l'histoire
        </p>
      </div>

      {/* Sélecteur de type */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-amber-800 mb-4">Choisir un type d'abacus :</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {abacusTypes.map((type) => (
            <button
              key={type.id}
              onClick={() => handleTypeChange(type)}
              className={`p-4 rounded-lg border-2 text-left transition-all duration-200 ${
                selectedType.id === type.id
                  ? 'border-amber-600 bg-amber-100 shadow-lg'
                  : 'border-amber-300 bg-white hover:bg-amber-50'
              }`}
            >
              <h3 className="font-bold text-amber-900">{type.name}</h3>
              <p className="text-sm text-amber-700">{type.period}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Informations sur le type sélectionné */}
      <div className="mb-8 p-6 bg-white rounded-lg shadow-lg border border-amber-200">
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-2xl font-bold text-amber-900">{selectedType.name}</h2>
          <button
            onClick={() => setShowInfo(!showInfo)}
            className="text-amber-600 hover:text-amber-800"
          >
            {showInfo ? '▼' : '▶'} Infos
          </button>
        </div>
        
        {showInfo && (
          <div className="space-y-2 text-amber-800">
            <p><strong>Période :</strong> {selectedType.period}</p>
            <p><strong>Description :</strong> {selectedType.description}</p>
            <p><strong>Fonction :</strong> {selectedType.function}</p>
            <p><strong>Base :</strong> {selectedType.base}</p>
            <p><strong>Plage par colonne :</strong> 0 à {selectedType.hasBeads ? 
              (selectedType.id === 'soroban' ? '9 (1×5 + 4×1)' :
               selectedType.id.includes('suanpan') ? '15 (2×5 + 5×1, mais retenue auto >9)' : 
               `${selectedType.upperBeads * 5 + selectedType.lowerBeads}`) :
              selectedType.tokensPerColumn}</p>
          </div>
        )}
      </div>

      {/* Affichage des retenues (pour les jetons) */}
      {!selectedType.hasBeads && carryOperations.length > 0 && (
        <div className="mb-4 p-4 bg-yellow-100 rounded-lg border border-yellow-300">
          <h3 className="font-bold text-yellow-800 mb-2">Retenues effectuées :</h3>
          {carryOperations.map((op, i) => (
            <p key={i} className="text-yellow-700 text-sm">
              Colonne {op.column}: {op.oldValue} → {op.newValue} + {op.carry} porté en colonne {op.carryTo}
            </p>
          ))}
        </div>
      )}

      {/* Abacus */}
      <div className="mb-8">
        {selectedType.hasBeads ? renderBeadAbacus() : renderTokenAbacus()}
      </div>

      {/* Contrôles et valeur */}
      <div className="flex justify-between items-center bg-white p-6 rounded-lg shadow-lg border border-amber-200">
        <div className="text-2xl font-bold text-amber-900">
          Valeur actuelle : <span className="text-3xl text-amber-600">{currentValue.toLocaleString()}</span>
          {selectedType.base === 60 && (
            <div className="text-sm text-amber-700 mt-1">
              (Base 60 - Système sexagésimal babylonien)
            </div>
          )}
        </div>
        
        <button
          onClick={reset}
          className="px-6 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors font-bold"
        >
          Réinitialiser
        </button>
      </div>

      {/* Instructions */}
      <div className="mt-8 p-6 bg-amber-100 rounded-lg border border-amber-300">
        <h3 className="text-lg font-bold text-amber-900 mb-2">Instructions :</h3>
        <div className="text-amber-800">
          {selectedType.hasBeads ? (
            <>
              <p>• Cliquez sur les perles pour les activer/désactiver (états compacts automatiques)</p>
              <p>• Perles rouges (section supérieure) : valeur 5 chacune</p>
              <p>• Perles bleues (section inférieure) : valeur 1 chacune</p>
              <p>• Chaque colonne représente une puissance de {selectedType.base}</p>
              {selectedType.id === 'soroban' && (
                <p>• <strong>Soroban :</strong> Maximum 1 perle haute + 4 basses par colonne (0-9)</p>
              )}
              {selectedType.id.includes('suanpan') && (
                <p>• <strong>Suanpan :</strong> Retenue automatique quand la valeur dépasse 9</p>
              )}
            </>
          ) : (
            <>
              <p>• Utilisez les boutons + et - pour ajouter/retirer des jetons</p>
              <p>• Chaque colonne représente une puissance de {selectedType.base}</p>
              <p>• Retenue automatique quand une colonne atteint {selectedType.base}</p>
              <p>• Plage valide par colonne : 0 à {selectedType.tokensPerColumn}</p>
              {selectedType.base === 60 && (
                <p>• <strong>Base 60 :</strong> Système utilisé pour l'astronomie et le commerce babylonien</p>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AbacusSimulator;