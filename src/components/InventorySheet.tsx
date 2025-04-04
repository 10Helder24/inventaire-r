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

  // Exemple : État pour la section INVENTAIRE DE LA HALLE
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

  // Fonction d'export vers Excel (ici export de la section HALLE)
  const exportToExcel = () => {
    const dataForExport = halleData.map((row, index) => ({
      "Numéro": row.numero,
      "Matière": index === 0 ? "PET bocal" : index === 1 ? "Rouleau emballage" : "Bouchons",
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
      <header className="bg-green-600 text-white shadow-lg">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Package className="h-6 w-6" />
            <h1 className="text-xl font-bold">Feuille d'inventaire</h1>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/manage')}
              className="flex items-center gap-2 px-4 py-2 bg-green-700 hover:bg-green-800 rounded-md transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              Retour
            </button>
            <div className="flex items-center gap-1 text-sm">
              <div className="w-2 h-2 bg-green-300 rounded-full"></div>
              <span>Vous travaillez en ligne</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm">{user.email}</span>
              <button
                onClick={handleSignOut}
                className="p-2 hover:bg-green-700 rounded-full transition-colors"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto p-6">
        <button
          onClick={exportToExcel}
          className="mb-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Exporter en Excel
        </button>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="grid grid-cols-2 gap-6">
            <div className="border rounded-lg p-4">
              <h2 className="text-lg font-bold mb-4 text-center">INVENTAIRE DE LA HALLE</h2>
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
                  <tr>
                    <td className="border px-2 py-1">
                      <input
                        type="number"
                        className="w-full"
                        value={halleData[0].numero}
                        onChange={(e) => handleHalleChange(0, 'numero', e.target.value)}
                      />
                    </td>
                    <td className="border px-2 py-1">PET broyé</td>
                    <td className="border px-2 py-1">
                      <input
                        type="number"
                        className="w-full"
                        value={halleData[0].bb}
                        onChange={(e) => handleHalleChange(0, 'bb', e.target.value)}
                      />
                    </td>
                    <td className="border px-2 py-1">
                      <input
                        type="number"
                        className="w-full"
                        value={halleData[0].palette}
                        onChange={(e) => handleHalleChange(0, 'palette', e.target.value)}
                      />
                    </td>
                  </tr>
                  <tr>
                    <td className="border px-2 py-1">
                      <input
                        type="number"
                        className="w-full"
                        value={halleData[1].numero}
                        onChange={(e) => handleHalleChange(1, 'numero', e.target.value)}
                      />
                    </td>
                    <td className="border px-2 py-1">Rouleau emballage</td>
                    <td className="border px-2 py-1">
                      <input
                        type="number"
                        className="w-full"
                        value={halleData[1].bb}
                        onChange={(e) => handleHalleChange(1, 'bb', e.target.value)}
                      />
                    </td>
                    <td className="border px-2 py-1">
                      <input
                        type="number"
                        className="w-full"
                        value={halleData[1].palette}
                        onChange={(e) => handleHalleChange(1, 'palette', e.target.value)}
                      />
                    </td>
                  </tr>
                  <tr>
                    <td className="border px-2 py-1">
                      <input
                        type="number"
                        className="w-full"
                        value={halleData[2].numero}
                        onChange={(e) => handleHalleChange(2, 'numero', e.target.value)}
                      />
                    </td>
                    <td className="border px-2 py-1">Bouchons</td>
                    <td className="border px-2 py-1">
                      <input
                        type="number"
                        className="w-full"
                        value={halleData[2].bb}
                        onChange={(e) => handleHalleChange(2, 'bb', e.target.value)}
                      />
                    </td>
                    <td className="border px-2 py-1">
                      <input
                        type="number"
                        className="w-full"
                        value={halleData[2].palette}
                        onChange={(e) => handleHalleChange(2, 'palette', e.target.value)}
                      />
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="border rounded-lg p-4">
              <h2 className="text-lg font-bold mb-4 text-center">INVENTAIRE</h2>
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
                  <tr>
                    <td className="border px-2 py-1">
                      <input type="number" className="w-full" defaultValue={""} />
                    </td>
                    <td className="border px-2 py-1">Inerte</td>
                    <td className="border px-2 py-1">
                      <input type="number" className="w-full" defaultValue={"0"} />
                    </td>
                    <td className="border px-2 py-1">
                      <input type="number" className="w-full" defaultValue={"0"} />
                    </td>
                  </tr>
                  <tr>
                    <td className="border px-2 py-1">
                      <input type="number" className="w-full" defaultValue={""} />
                    </td>
                    <td className="border px-2 py-1">Bois à problème</td>
                    <td className="border px-2 py-1">
                      <input type="number" className="w-full" defaultValue={"0"} />
                    </td>
                    <td className="border px-2 py-1">
                      <input type="number" className="w-full" defaultValue={"0"} />
                    </td>
                  </tr>
                  <tr>
                    <td className="border px-2 py-1">
                      <input type="number" className="w-full" defaultValue={""} />
                    </td>
                    <td className="border px-2 py-1">Alu propre</td>
                    <td className="border px-2 py-1">
                      <input type="number" className="w-full" defaultValue={"0"} />
                    </td>
                    <td className="border px-2 py-1">
                      <input type="number" className="w-full" defaultValue={"0"} />
                    </td>
                  </tr>
                  <tr>
                    <td className="border px-2 py-1">
                      <input type="number" className="w-full" defaultValue={""} />
                    </td>
                    <td className="border px-2 py-1">Fer léger</td>
                    <td className="border px-2 py-1">
                      <input type="number" className="w-full" defaultValue={"0"} />
                    </td>
                    <td className="border px-2 py-1">
                      <input type="number" className="w-full" defaultValue={"0"} />
                    </td>
                  </tr>
                  <tr>
                    <td className="border px-2 py-1">
                      <input type="number" className="w-full" defaultValue={""} />
                    </td>
                    <td className="border px-2 py-1">Fer propre</td>
                    <td className="border px-2 py-1">
                      <input type="number" className="w-full" defaultValue={"0"} />
                    </td>
                    <td className="border px-2 py-1">
                      <input type="number" className="w-full" defaultValue={"0"} />
                    </td>
                  </tr>
                  <tr>
                    <td className="border px-2 py-1">
                      <input type="number" className="w-full" defaultValue={""} />
                    </td>
                    <td className="border px-2 py-1">Déchets</td>
                    <td className="border px-2 py-1">
                      <input type="number" className="w-full" defaultValue={"0"} />
                    </td>
                    <td className="border px-2 py-1">
                      <input type="number" className="w-full" defaultValue={"0"} />
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="border rounded-lg p-4">
              <h2 className="text-lg font-bold mb-4 text-center">Plastique en balle</h2>
              <table className="w-full text-sm">
                <thead>
                  <tr>
                    <th className="border px-2 py-1">Numéro</th>
                    <th className="border px-2 py-1">Matière</th>
                    <th className="border px-2 py-1">N° de balles</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border px-2 py-1">1.02</td>
                    <td className="border px-2 py-1">
                      <input type="text" className="w-full" defaultValue={"Ordinaire en balle (950)"} />
                    </td>
                    <td className="border px-2 py-1">
                      <input type="number" className="w-full" defaultValue={"1078050"} />
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="border rounded-lg p-4">
              <h2 className="text-lg font-bold mb-4 text-center">AUTRES</h2>
              <table className="w-full text-sm">
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
                      <input type="number" className="w-full" defaultValue={""} />
                    </td>
                    <td className="border px-2 py-1">
                      <input type="number" className="w-full" defaultValue={""} />
                    </td>
                  </tr>
                  <tr>
                    <td className="border px-2 py-1">AD blue</td>
                    <td className="border px-2 py-1">
                      <input type="number" className="w-full" defaultValue={"1900"} />
                    </td>
                    <td className="border px-2 py-1">
                      <input type="number" className="w-full" defaultValue={"18"} />
                    </td>
                  </tr>
                  <tr>
                    <td className="border px-2 py-1">Stock fil de fer</td>
                    <td className="border px-2 py-1">
                      <input type="number" className="w-full" defaultValue={""} />
                    </td>
                    <td className="border px-2 py-1">
                      <input type="number" className="w-full" defaultValue={""} />
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="col-span-2 border rounded-lg p-4">
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
                      <input type="number" className="w-full" defaultValue={""} />
                    </td>
                    <td className="border px-2 py-1">
                      <input type="number" className="w-full" defaultValue={"1078050"} />
                    </td>
                  </tr>
                  <tr>
                    <td className="border px-2 py-1">Morgevon 13</td>
                    <td className="border px-2 py-1">
                      <input type="number" className="w-full" defaultValue={"2354"} />
                    </td>
                    <td className="border px-2 py-1">
                      <input type="number" className="w-full" defaultValue={"563623"} />
                    </td>
                  </tr>
                  <tr>
                    <td className="border px-2 py-1">Halle à bois</td>
                    <td className="border px-2 py-1">
                      <input type="number" className="w-full" defaultValue={"1727"} />
                    </td>
                    <td className="border px-2 py-1">
                      <input type="number" className="w-full" defaultValue={"780398"} />
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="col-span-2 border rounded-lg p-4">
              <h2 className="text-lg font-bold mb-4 text-center">OUTILS DE MANUTENTION</h2>
              <table className="w-full text-sm">
                <thead>
                  <tr>
                    <th className="border px-2 py-1">N° Machine</th>
                    <th className="border px-2 py-1">Désignation</th>
                    <th className="border px-2 py-1">Heures</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border px-2 py-1">
                      <input type="text" className="w-full" defaultValue={"2.0.10"} />
                    </td>
                    <td className="border px-2 py-1">Linde pince H45</td>
                    <td className="border px-2 py-1">
                      <input type="number" className="w-full" defaultValue={"2403"} />
                    </td>
                  </tr>
                  <tr>
                    <td className="border px-2 py-1">
                      <input type="text" className="w-full" defaultValue={"2.0.07"} />
                    </td>
                    <td className="border px-2 py-1">Linde pince H50</td>
                    <td className="border px-2 py-1">
                      <input type="number" className="w-full" defaultValue={"0"} />
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="col-span-2 mt-8 grid grid-cols-2 gap-6">
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

          <div className="col-span-2 text-center mt-4">
            <p className="font-bold">
              INVENTAIRE DU MOIS DE: {new Date().toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}