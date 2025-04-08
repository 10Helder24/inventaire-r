import React, { useState } from 'react';
import { Package, LogOut, ArrowLeft, Search, FolderOpen, Upload, Trash2, X, Plus, Save } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import * as XLSX from 'xlsx';
import { supabase } from '../supabaseClient';
import type { Article } from '../types';

interface InventorySheetProps {
  articles: Article[];
  user: any;
  signOut: () => Promise<void>;
}

interface InventoryData {
  plastiqueBB: {
    matiere: string;
    bb: number;
    palette: number;
  }[];
  plastiqueBalle: {
    matiere: string;
    balle: number;
    palette: number;
  }[];
  cdt: {
    matiere: string;
    m3: number;
    tonne: number;
  }[];
  papierBalle: {
    numero: string;
    matiere: string;
    balle: number;
  }[];
  autres: {
    diesel: { litres: number; piece: number };
    adBlue: { litres: number; piece: number };
    filFer: { litres: number; piece: number };
  };
  eau: {
    morgevon11: { m3: number; compteur: number };
    morgevon13: { m3: number; compteur: number };
    halleBois: { m3: number; compteur: number };
  };
  machines: {
    numero: string;
    machine: string;
    balle: number;
    heure: number;
  }[];
}

export function InventorySheet({ articles, user, signOut }: InventorySheetProps) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('plastiquebb');
  const [inventoryData, setInventoryData] = useState<InventoryData>({
    plastiqueBB: [
      { matiere: 'PET broyé', bb: 0, palette: 0 },
      { matiere: 'Rouleau emballage', bb: 0, palette: 0 },
      { matiere: 'Bouchons', bb: 0, palette: 0 },
      { matiere: 'CD', bb: 0, palette: 0 },
      { matiere: 'Big bag', bb: 0, palette: 0 }
    ],
    plastiqueBalle: [
      { matiere: 'Polyéthyène 98/2', balle: 0, palette: 0 },
      { matiere: 'Polyéthyène 90/10', balle: 0, palette: 0 },
      { matiere: 'Canettes Alu (400)', balle: 0, palette: 0 },
      { matiere: 'Bouteilles de lait (380)', balle: 0, palette: 0 },
      { matiere: 'Plaque bleu PP', balle: 0, palette: 0 },
      { matiere: 'Ligatures Strapex', balle: 0, palette: 0 },
      { matiere: 'Opercule', balle: 0, palette: 0 },
      { matiere: 'PP', balle: 0, palette: 0 },
      { matiere: 'PS', balle: 0, palette: 0 },
      { matiere: 'Pet bouteille (370)', balle: 0, palette: 0 }
    ],
    cdt: [
      { matiere: 'Inerte', m3: 0, tonne: 0 },
      { matiere: 'Bois à problème', m3: 0, tonne: 0 },
      { matiere: 'Alu propre', m3: 0, tonne: 0 },
      { matiere: 'Fer léger', m3: 0, tonne: 0 },
      { matiere: 'Fer propre', m3: 0, tonne: 0 },
      { matiere: 'Déchets', m3: 0, tonne: 0 }
    ],
    papierBalle: [
      { numero: '1.02', matiere: 'Ordinaire en balle (950)', balle: 0 },
      { numero: '1.04', matiere: 'Carton mixte (900)', balle: 0 },
      { numero: '1.05', matiere: 'Carton propre (800)', balle: 0 },
      { numero: '2.06', matiere: 'Écrit couleur n°2 (750)', balle: 0 },
      { numero: '2.06', matiere: 'Broyé (850)', balle: 0 },
      { numero: '3.03', matiere: 'Rognures d\'imprimerie', balle: 0 },
      { numero: '3.05', matiere: 'Écrit blanc (750)', balle: 0 },
      { numero: '3.08', matiere: 'Cellulose (blanche)', balle: 0 },
      { numero: '3.10', matiere: 'Afnor7 (950)', balle: 0 },
      { numero: '3.18', matiere: 'Blanc (900)', balle: 0 },
      { numero: '4.02', matiere: 'Natron (750)', balle: 0 },
      { numero: '2.02', matiere: 'Journaux invendus', balle: 0 },
      { numero: '3.14', matiere: 'Papier blanc journaux', balle: 0 },
      { numero: '3.17', matiere: 'Rognures journaux', balle: 0 },
      { numero: '1.04', matiere: 'Marvinpac', balle: 0 }
    ],
    autres: {
      diesel: { litres: 0, piece: 0 },
      adBlue: { litres: 1900, piece: 18 },
      filFer: { litres: 0, piece: 0 }
    },
    eau: {
      morgevon11: { m3: 0, compteur: 1078050 },
      morgevon13: { m3: 2354, compteur: 563623 },
      halleBois: { m3: 1727, compteur: 780398 }
    },
    machines: [
      { numero: '2.0.10', machine: 'Linde pince H45', balle: 0, heure: 0 },
      { numero: '2.0.07', machine: 'Linde pince H50', balle: 0, heure: 0 },
      { numero: '2.0.09', machine: 'Linde tour.H25/D600', balle: 0, heure: 0 },
      { numero: '2.0.08', machine: 'Linde tour.H25/D600', balle: 0, heure: 0 },
      { numero: '2.0.11', machine: 'Linde transpal.Gerbeur P-F', balle: 0, heure: 0 },
      { numero: '2.0.12', machine: 'Linde transpal.Gerbeur', balle: 0, heure: 0 },
      { numero: '2.0.13', machine: 'Toyota fourche)', balle: 0, heure: 0 },
      { numero: '2.0.40', machine: 'Linde H45 tournante', balle: 0, heure: 0 },
      { numero: '2.0.02', machine: 'Liebherr 526', balle: 0, heure: 0 },
      { numero: '2.0.15', machine: 'Palan', balle: 0, heure: 0 },
      { numero: '2.0.06', machine: 'Grue Fuchs 335 new', balle: 0, heure: 0 },
      { numero: '2.0.38', machine: 'Grue Liebherr LH22', balle: 0, heure: 0 },
      { numero: '2.0.39', machine: 'Grue Cat MH3024', balle: 0, heure: 0 },
      { numero: '2.0.17', machine: 'Compresseur GA 20 VSD', balle: 0, heure: 0 },
      { numero: '2.0.16', machine: 'Compresseur GA 30 VSD', balle: 0, heure: 0 },
      { numero: '2.0.25', machine: 'Aktid convoyeur', balle: 0, heure: 0 },
      { numero: '2.0.22', machine: 'Forus/F400', balle: 0, heure: 0 },
      { numero: '2.0.23', machine: 'Forus/BZ396', balle: 0, heure: 0 },
      { numero: '2.0.27', machine: 'Broyeur Hammel', balle: 0, heure: 0 },
      { numero: '2.0.34', machine: 'Tapis Bois', balle: 0, heure: 0 },
      { numero: '2.0.19', machine: 'Presse Pall', balle: 0, heure: 0 },
      { numero: '2.0.24', machine: 'Titech', balle: 0, heure: 0 },
      { numero: '2.0.05', machine: 'Linde pince H50 new', balle: 0, heure: 0 },
      { numero: '2.0.04', machine: 'Liebherr T60-9 S', balle: 0, heure: 0 },
      { numero: '2.0.42', machine: 'Linde new H35', balle: 0, heure: 0 },
      { numero: '2.0.41', machine: 'Linde new H25', balle: 0, heure: 0 },
      { numero: '2.0.29', machine: 'Broyeur Satrindtech', balle: 0, heure: 0 },
      { numero: '2.0.37', machine: 'Linde L12 Atelier', balle: 0, heure: 0 }
    ]
  });

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    }
  };

  const saveInventory = async () => {
    try {
      const { error } = await supabase
        .from('inventory_sheets')
        .insert([
          {
            date: new Date().toISOString(),
            data: inventoryData,
            created_by: user.email
          }
        ]);

      if (error) throw error;
      toast.success('Inventaire sauvegardé avec succès');
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      toast.error('Erreur lors de la sauvegarde de l\'inventaire');
    }
  };

  const exportToExcel = () => {
    // Créer des feuilles de calcul pour chaque section
    const workbook = XLSX.utils.book_new();

    // Plastique BB
    const plastiqueBBData = inventoryData.plastiqueBB.map(item => ({
      'Matière': item.matiere,
      'BB': item.bb,
      'Palette': item.palette
    }));
    const plastiqueBBSheet = XLSX.utils.json_to_sheet(plastiqueBBData);
    XLSX.utils.book_append_sheet(workbook, plastiqueBBSheet, 'Plastique BB');

    // Plastique en balles
    const plastiqueBalleData = inventoryData.plastiqueBalle.map(item => ({
      'Matière': item.matiere,
      'Balles': item.balle,
      'Palette': item.palette
    }));
    const plastiqueBalleSheet = XLSX.utils.json_to_sheet(plastiqueBalleData);
    XLSX.utils.book_append_sheet(workbook, plastiqueBalleSheet, 'Plastique Balles');

    // CDT
    const cdtData = inventoryData.cdt.map(item => ({
      'Matière': item.matiere,
      'm³': item.m3,
      'Tonnes': item.tonne
    }));
    const cdtSheet = XLSX.utils.json_to_sheet(cdtData);
    XLSX.utils.book_append_sheet(workbook, cdtSheet, 'CDT');

    // Papier en balles
    const papierBalleData = inventoryData.papierBalle.map(item => ({
      'Numéro': item.numero,
      'Matière': item.matiere,
      'Balles': item.balle
    }));
    const papierBalleSheet = XLSX.utils.json_to_sheet(papierBalleData);
    XLSX.utils.book_append_sheet(workbook, papierBalleSheet, 'Papier Balles');

    // Autres
    const autresData = [
      { 'Type': 'Diesel', 'Litres': inventoryData.autres.diesel.litres, 'Pièces': inventoryData.autres.diesel.piece },
      { 'Type': 'AD Blue', 'Litres': inventoryData.autres.adBlue.litres, 'Pièces': inventoryData.autres.adBlue.piece },
      { 'Type': 'Fil de fer', 'Litres': inventoryData.autres.filFer.litres, 'Pièces': inventoryData.autres.filFer.piece }
    ];
    const autresSheet = XLSX.utils.json_to_sheet(autresData);
    XLSX.utils.book_append_sheet(workbook, autresSheet, 'Autres');

    // Eau
    const eauData = [
      { 'Compteur': 'Morgevon 11', 'm³': inventoryData.eau.morgevon11.m3, 'Valeur': inventoryData.eau.morgevon11.compteur },
      { 'Compteur': 'Morgevon 13', 'm³': inventoryData.eau.morgevon13.m3, 'Valeur': inventoryData.eau.morgevon13.compteur },
      { 'Compteur': 'Halle à bois', 'm³': inventoryData.eau.halleBois.m3, 'Valeur': inventoryData.eau.halleBois.compteur }
    ];
    const eauSheet = XLSX.utils.json_to_sheet(eauData);
    XLSX.utils.book_append_sheet(workbook, eauSheet, 'Eau');

    // Machines
    const machinesData = inventoryData.machines.map(item => ({
      'Numéro': item.numero,
      'Machine': item.machine,
      'Balles': item.balle,
      'Heures': item.heure
    }));
    const machinesSheet = XLSX.utils.json_to_sheet(machinesData);
    XLSX.utils.book_append_sheet(workbook, machinesSheet, 'Machines');

    // Exporter le fichier
    XLSX.writeFile(workbook, `inventaire_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const updateInventoryData = (section: keyof InventoryData, index: number, field: string, value: string | number) => {
    const newData = { ...inventoryData };
    if (Array.isArray(newData[section])) {
      (newData[section] as any[])[index] = {
        ...(newData[section] as any[])[index],
        [field]: typeof value === 'string' ? value : Number(value)
      };
    }
    setInventoryData(newData);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-green-600 text-white shadow-lg fixed top-0 left-0 right-0 z-50">
        <div className="container mx-auto px-4 py-3">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex items-center gap-2">
              <Package className="h-6 w-6" />
              <h1 className="text-xl font-bold">Feuille d'inventaire</h1>
            </div>
            <div className="flex flex-wrap items-center gap-4">
              <button
                onClick={() => navigate('/manage')}
                className="flex items-center gap-2 px-4 py-2 bg-green-700 hover:bg-green-800 rounded-md transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
                Retour
              </button>
              <button
                onClick={saveInventory}
                className="flex items-center gap-2 px-4 py-2 bg-green-700 hover:bg-green-800 rounded-md transition-colors"
              >
                <Save className="h-5 w-5" />
                Sauvegarder
              </button>
              <button
                onClick={exportToExcel}
                className="flex items-center gap-2 px-4 py-2 bg-green-700 hover:bg-green-800 rounded-md transition-colors"
              >
                <Upload className="h-5 w-5" />
                Exporter Excel
              </button>
              <div className="hidden sm:flex items-center gap-1 text-sm">
                <div className="w-2 h-2 bg-green-300 rounded-full"></div>
                <span>En ligne</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm hidden sm:inline">{user.email}</span>
                <button
                  onClick={handleSignOut}
                  className="p-2 hover:bg-green-700 rounded-full transition-colors"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 pt-24 pb-6">
        {/* Navigation des onglets */}
        <div className="flex overflow-x-auto mb-4 -mx-4 px-4 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('plastiquebb')}
            className={`px-4 py-2 whitespace-nowrap ${
              activeTab === 'plastiquebb' ? 'text-green-600 border-b-2 border-green-600' : 'text-gray-600'
            }`}
          >
            Plastique en BB
          </button>
          <button
            onClick={() => setActiveTab('plastiqueballe')}
            className={`px-4 py-2 whitespace-nowrap ${
              activeTab === 'plastiqueballe' ? 'text-green-600 border-b-2 border-green-600' : 'text-gray-600'
            }`}
          >
            Plastique en balles
          </button>
          <button
            onClick={() => setActiveTab('cdt')}
            className={`px-4 py-2 whitespace-nowrap ${
              activeTab === 'cdt' ? 'text-green-600 border-b-2 border-green-600' : 'text-gray-600'
            }`}
          >
            CDT
          </button>
          <button
            onClick={() => setActiveTab('papierballe')}
            className={`px-4 py-2 whitespace-nowrap ${
              activeTab === 'papierballe' ? 'text-green-600 border-b-2 border-green-600' : 'text-gray-600'
            }`}
          >
            Papier en balles
          </button>
          <button
            onClick={() => setActiveTab('autres')}
            className={`px-4 py-2 whitespace-nowrap ${
              activeTab === 'autres' ? 'text-green-600 border-b-2 border-green-600' : 'text-gray-600'
            }`}
          >
            Autres
          </button>
          <button
            onClick={() => setActiveTab('machines')}
            className={`px-4 py-2 whitespace-nowrap ${
              activeTab === 'machines' ? 'text-green-600 border-b-2 border-green-600' : 'text-gray-600'
            }`}
          >
            Machines
          </button>
        </div>

        {/* Contenu des onglets */}
        <div className="bg-white rounded-lg shadow-md p-4">
          {/* Plastique BB */}
          {activeTab === 'plastiquebb' && (
            <div>
              <h2 className="text-lg font-bold mb-4">Plastique en BB</h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr>
                      <th className="border px-4 py-2">Matière</th>
                      <th className="border px-4 py-2">BB</th>
                      <th className="border px-4 py-2">Palette</th>
                    </tr>
                  </thead>
                  <tbody>
                    {inventoryData.plastiqueBB.map((item, index) => (
                      <tr key={index}>
                        <td className="border px-4 py-2">{item.matiere}</td>
                        <td className="border px-4 py-2">
                          <input
                            type="number"
                            value={item.bb}
                            onChange={(e) => updateInventoryData('plastiqueBB', index, 'bb', e.target.value)}
                            className="w-full p-1"
                          />
                        </td>
                        <td className="border px-4 py-2">
                          <input
                            type="number"
                            value={item.palette}
                            onChange={(e) => updateInventoryData('plastiqueBB', index, 'palette', e.target.value)}
                            className="w-full p-1"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Plastique en balles */}
          {activeTab === 'plastiqueballe' && (
            <div>
              <h2 className="text-lg font-bold mb-4">Plastique en balles</h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr>
                      <th className="border px-4 py-2">Matière</th>
                      <th className="border px-4 py-2">Balles</th>
                      <th className="border px-4 py-2">Palette</th>
                    </tr>
                  </thead>
                  <tbody>
                    {inventoryData.plastiqueBalle.map((item, index) => (
                      <tr key={index}>
                        <td className="border px-4 py-2">{item.matiere}</td>
                        <td className="border px-4 py-2">
                          <input
                            type="number"
                            value={item.balle}
                            onChange={(e) => updateInventoryData('plastiqueBalle', index, 'balle', e.target.value)}
                            className="w-full p-1"
                          />
                        </td>
                        <td className="border px-4 py-2">
                          <input
                            type="number"
                            value={item.palette}
                            onChange={(e) => updateInventoryData('plastiqueBalle', index, 'palette', e.target.value)}
                            className="w-full p-1"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* CDT */}
          {activeTab === 'cdt' && (
            <div>
              <h2 className="text-lg font-bold mb-4">CDT</h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr>
                      <th className="border px-4 py-2">Matière</th>
                      <th className="border px-4 py-2">m³</th>
                      <th className="border px-4 py-2">Tonnes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {inventoryData.cdt.map((item, index) => (
                      <tr key={index}>
                        <td className="border px-4 py-2">{item.matiere}</td>
                        <td className="border px-4 py-2">
                          <input
                            type="number"
                            value={item.m3}
                            onChange={(e) => updateInventoryData('cdt', index, 'm3', e.target.value)}
                            className="w-full p-1"
                          />
                        </td>
                        <td className="border px-4 py-2">
                          <input
                            type="number"
                            value={item.tonne}
                            onChange={(e) => updateInventoryData('cdt', index, 'tonne', e.target.value)}
                            className="w-full p-1"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Papier en balles */}
          {activeTab === 'papierballe' && (
            <div>
              <h2 className="text-lg font-bold mb-4">Papier en balles</h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr>
                      <th className="border px-4 py-2">Numéro</th>
                      <th className="border px-4 py-2">Matière</th>
                      <th className="border px-4 py-2">Balles</th>
                    </tr>
                  </thead>
                  <tbody>
                    {inventoryData.papierBalle.map((item, index) => (
                      <tr key={index}>
                        <td className="border px-4 py-2">{item.numero}</td>
                        <td className="border px-4 py-2">{item.matiere}</td>
                        <td className="border px-4 py-2">
                          <input
                            type="number"
                            value={item.balle}
                            onChange={(e) => updateInventoryData('papierBalle', index, 'balle', e.target.value)}
                            className="w-full p-1"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Autres */}
          {activeTab === 'autres' && (
            <div>
              <h2 className="text-lg font-bold mb-4">Autres</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="overflow-x-auto">
                  <h3 className="text-md font-semibold mb-2">Stock</h3>
                  <table className="w-full">
                    <thead>
                      <tr>
                        <th className="border px-4 py-2">Type</th>
                        <th className="border px-4 py-2">Litres</th>
                        <th className="border px-4 py-2">Pièces</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="border px-4 py-2">Diesel</td>
                        <td className="border px-4 py-2">
                          <input
                            type="number"
                            value={inventoryData.autres.diesel.litres}
                            onChange={(e) => {
                              const newData = { ...inventoryData };
                              newData.autres.diesel.litres = Number(e.target.value);
                              setInventoryData(newData);
                            }}
                            className="w-full p-1"
                          />
                        </td>
                        <td className="border px-4 py-2">
                          <input
                            type="number"
                            value={inventoryData.autres.diesel.piece}
                            onChange={(e) => {
                              const newData = { ...inventoryData };
                              newData.autres.diesel.piece = Number(e.target.value);
                              setInventoryData(newData);
                            }}
                            className="w-full p-1"
                          />
                        </td>
                      </tr>
                      <tr>
                        <td className="border px-4 py-2">AD Blue</td>
                        <td className="border px-4 py-2">
                          <input
                            type="number"
                            value={inventoryData.autres.adBlue.litres}
                            onChange={(e) => {
                              const newData = { ...inventoryData };
                              newData.autres.adBlue.litres = Number(e.target.value);
                              setInventoryData(newData);
                            }}
                            className="w-full p-1"
                          />
                        </td>
                        <td className="border px-4 py-2">
                          <input
                            type="number"
                            value={inventoryData.autres.adBlue.piece}
                            onChange={(e) => {
                              const newData = { ...inventoryData };
                              newData.autres.adBlue.piece = Number(e.target.value);
                              setInventoryData(newData);
                            }}
                            className="w-full p-1"
                          />
                        </td>
                      </tr>
                      <tr>
                        <td className="border px-4 py-2">Fil de fer</td>
                        <td className="border px-4 py-2">
                          <input
                            type="number"
                            value={inventoryData.autres.filFer.litres}
                            onChange={(e) => {
                              const newData = { ...inventoryData };
                              newData.autres.filFer.litres = Number(e.target.value);
                              setInventoryData(newData);
                            }}
                            className="w-full p-1"
                          />
                        </td>
                        <td className="border px-4 py-2">
                          <input
                            type="number"
                            value={inventoryData.autres.filFer.piece}
                            onChange={(e) => {
                              const newData = { ...inventoryData };
                              newData.autres.filFer.piece = Number(e.target.value);
                              setInventoryData(newData);
                            }}
                            className="w-full p-1"
                          />
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="overflow-x-auto">
                  <h3 className="text-md font-semibold mb-2">Eau (Compteurs)</h3>
                  <table className="w-full">
                    <thead>
                      <tr>
                        <th className="border px-4 py-2">Compteur</th>
                        <th className="border px-4 py-2">m³</th>
                        <th className="border px-4 py-2">Valeur</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="border px-4 py-2">Morgevon 11</td>
                        <td className="border px-4 py-2">
                          <input
                            type="number"
                            value={inventoryData.eau.morgevon11.m3}
                            onChange={(e) => {
                              const newData = { ...inventoryData };
                              newData.eau.morgevon11.m3 = Number(e.target.value);
                              setInventoryData(newData);
                            }}
                            className="w-full p-1"
                          />
                        </td>
                        <td className="border px-4 py-2">
                          <input
                            type="number"
                            value={inventoryData.eau.morgevon11.compteur}
                            onChange={(e) => {
                              const newData = { ...inventoryData };
                              newData.eau.morgevon11.compteur = Number(e.target.value);
                              setInventoryData(newData);
                            }}
                            className="w-full p-1"
                          />
                        </td>
                      </tr>
                      <tr>
                        <td className="border px-4 py-2">Morgevon 13</td>
                        <td className="border px-4 py-2">
                          <input
                            type="number"
                            value={inventoryData.eau.morgevon13.m3}
                            onChange={(e) => {
                              const newData = { ...inventoryData };
                              newData.eau.morgevon13.m3 = Number(e.target.value);
                              setInventoryData(newData);
                            }}
                            className="w-full p-1"
                          />
                        </td>
                        <td className="border px-4 py-2">
                          <input
                            type="number"
                            value={inventoryData.eau.morgevon13.compteur}
                            onChange={(e) => {
                              const newData = { ...inventoryData };
                              newData.eau.morgevon13.compteur = Number(e.target.value);
                              setInventoryData(newData);
                            }}
                            className="w-full p-1"
                          />
                        </td>
                      </tr>
                      <tr>
                        <td className="border px-4 py-2">Halle à bois</td>
                        <td className="border px-4 py-2">
                          <input
                            type="number"
                            value={inventoryData.eau.halleBois.m3}
                            onChange={(e) => {
                              const newData = { ...inventoryData };
                              newData.eau.halleBois.m3 = Number(e.target.value);
                              setInventoryData(newData);
                            }}
                            className="w-full p-1"
                          />
                        </td>
                        <td className="border px-4 py-2">
                          <input
                            type="number"
                            value={inventoryData.eau.halleBois.compteur}
                            onChange={(e) => {
                              const newData = { ...inventoryData };
                              newData.eau.halleBois.compteur = Number(e.target.value);
                              setInventoryData(newData);
                            }}
                            className="w-full p-1"
                          />
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Machines */}
          {activeTab === 'machines' && (
            <div>
              <h2 className="text-lg font-bold mb-4">Machines</h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr>
                      <th className="border px-4 py-2">Numéro</th>
                      <th className="border px-4 py-2">Machine</th>
                      <th className="border px-4 py-2">Balles</th>
                      <th className="border px-4 py-2">Heures</th>
                    </tr>
                  </thead>
                  <tbody>
                    {inventoryData.machines.map((item, index) => (
                      <tr key={index}>
                        <td className="border px-4 py-2">{item.numero}</td>
                        <td className="border px-4 py-2">{item.machine}</td>
                        <td className="border px-4 py-2">
                          <input
                            type="number"
                            value={item.balle}
                            onChange={(e) => updateInventoryData('machines', index, 'balle', e.target.value)}
                            className="w-full p-1"
                          />
                        </td>
                        <td className="border px-4 py-2">
                          <input
                            type="number"
                            value={item.heure}
                            onChange={(e) => updateInventoryData('machines', index, 'heure', e.target.value)}
                            className="w-full p-1"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <p className="font-bold mb-2">Établi par:</p>
            <p>{user.email}</p>
          </div>
          <div>
            <p className="font-bold mb-2">Vérifié par:</p>
            <p>Nom: _________________</p>
            <p>Signature: _________________</p>
          </div>
        </div>

        <div className="text-center mt-4">
          <p className="font-bold">
            INVENTAIRE DU MOIS DE: {new Date().toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
          </p>
        </div>
      </main>
    </div>
  );
}
