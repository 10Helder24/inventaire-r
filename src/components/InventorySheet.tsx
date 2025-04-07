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

export function InventorySheet({ articles, user, signOut }: InventorySheetProps) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('halle');

  // État pour la section INVENTAIRE DE LA HALLE
  const [halleData, setHalleData] = useState([
    { numero: "", bb: "", palette: "" },
    { numero: "", bb: "", palette: "10" },
    { numero: "", bb: "", palette: "0" }
  ]);

  // Fonction de mise à jour pour la section HALLE
  const handleHalleChange = (index: number, field: string, value: string) => {
    const newData = [...halleData];
    newData[index] = { ...newData[index], [field]: value };
    setHalleData(newData);
  };

  // Fonction d'export vers Excel
  const exportToExcel = () => {
    const dataForExport = halleData.map((row, index) => ({
      "Numéro": row.numero,
      "Matière": index === 0 ? "PET broyé" : index === 1 ? "Rouleau emballage" : "Bouchons",
      "BB": row.bb,
      "Palette": row.palette
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataForExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Inventaire Halle");
    XLSX.writeFile(workbook, "inventaire.xlsx");
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-green-600 text-white shadow-lg fixed top-0 left-0 right-0 z-50">
        <div className="container mx-auto px-4 py-3">
          <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center justify-between">
            <div className="flex items-center gap-2">
              <Package className="h-6 w-6" />
              <h1 className="text-xl font-bold">Feuille d'inventaire</h1>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => navigate('/manage')}
                className="flex items-center gap-2 px-4 py-2 bg-green-700 hover:bg-green-800 rounded-md transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
                Retour
              </button>
              <div className="hidden sm:flex items-center gap-1 text-sm">
                <div className="w-2 h-2 bg-green-300 rounded-full"></div>
                <span>Vous travaillez en ligne</span>
              </div>
              <div className="flex items-center gap-2">
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

      <main className="container mx-auto px-4 pt-20 pb-6">
        <button
          onClick={exportToExcel}
          className="mb-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors w-full sm:w-auto"
        >
          Exporter en Excel
        </button>

        {/* Navigation des onglets mobile */}
        <div className="flex overflow-x-auto mb-4 -mx-4 px-4 sm:hidden">
          <button
            onClick={() => setActiveTab('halle')}
            className={`px-4 py-2 whitespace-nowrap ${
              activeTab === 'halle' ? 'text-green-600 border-b-2 border-green-600' : 'text-gray-600'
            }`}
          >
            Plastique en BB ou PAL
          </button>
          <button
            onClick={() => setActiveTab('inventaire')}
            className={`px-4 py-2 whitespace-nowrap ${
              activeTab === 'inventaire' ? 'text-green-600 border-b-2 border-green-600' : 'text-gray-600'
            }`}
          >
            Plastique en balles
          </button>
          <button
            onClick={() => setActiveTab('plastique')}
            className={`px-4 py-2 whitespace-nowrap ${
              activeTab === 'plastique' ? 'text-green-600 border-b-2 border-green-600' : 'text-gray-600'
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
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Section INVENTAIRE DE LA HALLE */}
          <div className={`border rounded-lg p-4 overflow-x-auto ${activeTab !== 'halle' && 'hidden sm:block'}`}>
            <h2 className="text-lg font-bold mb-4 text-center">INVENTAIRE DE LA HALLE</h2>
            <div className="min-w-[600px] lg:min-w-0">
              <table className="w-full text-sm">
                <thead>
                  <tr>
                    <th className="border px-2 py-1">Numéro</th>
                    <th className="border px-2 py-1">Matière</th>
                    <th className="border px-2 py-1">BB</th>
                    <th className="border px-2 py-1">Palette</th>
                  </tr>
                </thead>
                <tbody>
                  {['PET broyé', 'Rouleau emballage', 'Bouchons'].map((matiere, index) => (
                    <tr key={matiere}>
                      <td className="border px-2 py-1">
                        <input
                          type="number"
                          className="w-full p-1"
                          value={halleData[index].numero}
                          onChange={(e) => handleHalleChange(index, 'numero', e.target.value)}
                        />
                      </td>
                      <td className="border px-2 py-1">{matiere}</td>
                      <td className="border px-2 py-1">
                        <input
                          type="number"
                          className="w-full p-1"
                          value={halleData[index].bb}
                          onChange={(e) => handleHalleChange(index, 'bb', e.target.value)}
                        />
                      </td>
                      <td className="border px-2 py-1">
                        <input
                          type="number"
                          className="w-full p-1"
                          value={halleData[index].palette}
                          onChange={(e) => handleHalleChange(index, 'palette', e.target.value)}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Section INVENTAIRE */}
          <div className={`border rounded-lg p-4 overflow-x-auto ${activeTab !== 'inventaire' && 'hidden sm:block'}`}>
            <h2 className="text-lg font-bold mb-4 text-center">CDT</h2>
            <div className="min-w-[600px] lg:min-w-0">
              <table className="w-full text-sm">
                <thead>
                  <tr>
                    <th className="border px-2 py-1">Numéro</th>
                    <th className="border px-2 py-1">Matière</th>
                    <th className="border px-2 py-1">m³</th>
                    <th className="border px-2 py-1">Tonnes</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    'Inerte',
                    'Bois à problème',
                    'Alu propre',
                    'Fer léger',
                    'Fer propre',
                    'Déchets'
                  ].map((matiere) => (
                    <tr key={matiere}>
                      <td className="border px-2 py-1">
                        <input type="number" className="w-full p-1" />
                      </td>
                      <td className="border px-2 py-1">{matiere}</td>
                      <td className="border px-2 py-1">
                        <input type="number" className="w-full p-1" defaultValue="0" />
                      </td>
                      <td className="border px-2 py-1">
                        <input type="number" className="w-full p-1" defaultValue="0" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Section Plastique en balle */}
          <div className={`border rounded-lg p-4 overflow-x-auto ${activeTab !== 'plastique' && 'hidden sm:block'}`}>
            <h2 className="text-lg font-bold mb-4 text-center">Papier en balle</h2>
            <div className="min-w-[600px] lg:min-w-0">
              <table className="w-full text-sm">
                <thead>
                  <tr>
                    <th className="border px-2 py-1">Numéro</th>
                    <th className="border px-2 py-1">Matière</th>
                    <th className="border px-2 py-1">N° de balles</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { num: '1.02', mat: 'Ordinaire en balle (950)', bal: '1078050' },
                    { num: '1.04', mat: 'Carton mixte (900)', bal: '1078050' },
                    { num: '1.05', mat: 'Carton propre (800)', bal: '1078050' },
                    { num: '2.06', mat: 'Écrit couleur n°2 (750)', bal: '1078050' },
                    { num: '2.06', mat: 'Broyé (850)', bal: '1078050' },
                    { num: '3.03', mat: 'Rognures d\'imprimerie', bal: '1078050' },
                    { num: '3.05', mat: 'Écrit blanc (750)', bal: '1078050' },
                    { num: '3.08', mat: 'Cellulose (blanche)', bal: '1078050' },
                    { num: '3.10', mat: 'Afnor7 (950)', bal: '1078050' },
                    { num: '3.18', mat: 'Blanc (900)', bal: '1078050' },
                    { num: '4.02', mat: 'Natron (750)', bal: '1078050' },
                    { num: '2.02', mat: 'Journaux invendus', bal: '1078050' },
                    { num: '3.14', mat: 'Papier blanc journaux', bal: '1078050' },
                    { num: '3.17', mat: 'Rognures journaux', bal: '1078050' },
                    { num: '1.04', mat: 'Marvinpac', bal: '1078050' }
                  ].map((item, index) => (
                    <tr key={index}>
                      <td className="border px-2 py-1">{item.num}</td>
                      <td className="border px-2 py-1">
                        <input type="text" className="w-full p-1" defaultValue={item.mat} />
                      </td>
                      <td className="border px-2 py-1">
                        <input type="number" className="w-full p-1" defaultValue={item.bal} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Section AUTRES */}
          <div className={`border rounded-lg p-4 overflow-x-auto ${activeTab !== 'autres' && 'hidden sm:block'}`}>
            <h2 className="text-lg font-bold mb-4 text-center">AUTRES</h2>
            <div className="min-w-[600px] lg:min-w-0">
              <table className="w-full text-sm mb-6">
                <thead>
                  <tr>
                    <th className="border px-2 py-1"></th>
                    <th className="border px-2 py-1">Litres</th>
                    <th className="border px-2 py-1">Pièce</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border px-2 py-1">Stock Diesel</td>
                    <td className="border px-2 py-1">
                      <input type="number" className="w-full p-1" />
                    </td>
                    <td className="border px-2 py-1">
                      <input type="number" className="w-full p-1" />
                    </td>
                  </tr>
                  <tr>
                    <td className="border px-2 py-1">AD blue</td>
                    <td className="border px-2 py-1">
                      <input type="number" className="w-full p-1" defaultValue="1900" />
                    </td>
                    <td className="border px-2 py-1">
                      <input type="number" className="w-full p-1" defaultValue="18" />
                    </td>
                  </tr>
                  <tr>
                    <td className="border px-2 py-1">Stock fil de fer</td>
                    <td className="border px-2 py-1">
                      <input type="number" className="w-full p-1" />
                    </td>
                    <td className="border px-2 py-1">
                      <input type="number" className="w-full p-1" />
                    </td>
                  </tr>
                </tbody>
              </table>

              <h2 className="text-lg font-bold mb-4 text-center">EAU (COMPTEUR)</h2>
              <table className="w-full text-sm">
                <thead>
                  <tr>
                    <th className="border px-2 py-1"></th>
                    <th className="border px-2 py-1">m³</th>
                    <th className="border px-2 py-1">Compteur</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border px-2 py-1">Morgevon 11</td>
                    <td className="border px-2 py-1">
                      <input type="number" className="w-full p-1" />
                    </td>
                    <td className="border px-2 py-1">
                      <input type="number" className="w-full p-1" defaultValue="1078050" />
                    </td>
                  </tr>
                  <tr>
                    <td className="border px-2 py-1">Morgevon 13</td>
                    <td className="border px-2 py-1">
                      <input type="number" className="w-full p-1" defaultValue="2354" />
                    </td>
                    <td className="border px-2 py-1">
                      <input type="number" className="w-full p-1" defaultValue="563623" />
                    </td>
                  </tr>
                  <tr>
                    <td className="border px-2 py-1">Halle à bois</td>
                    <td className="border px-2 py-1">
                      <input type="number" className="w-full p-1" defaultValue="1727" />
                    </td>
                    <td className="border px-2 py-1">
                      <input type="number" className="w-full p-1" defaultValue="780398" />
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <p className="font-bold mb-2">Établi par:</p>
            <p>Ferreira Heder</p>
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
