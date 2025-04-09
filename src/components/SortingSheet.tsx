import React, { useState } from 'react';
import { Package, LogOut, ArrowLeft, Download } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PDFDownloadLink, Document, Page, View, Text, StyleSheet } from '@react-pdf/renderer';

interface SortingSheetProps {
  user: any;
  signOut: () => Promise<void>;
}

// Définition des types de bennes
const binTypes = [
  { name: 'Déchets Incinérables', defaultValue: '' },
  { name: 'Déchets encombrants', defaultValue: '' },
  { name: 'Bois broyé', defaultValue: '' },
  { name: 'Carton', defaultValue: '' },
  { name: 'Bois propre', defaultValue: '' },
  { name: 'Alu propre', defaultValue: '' },
  { name: 'Métaux ferreux', defaultValue: '' },
  { name: 'Ferraille propre', defaultValue: '' },
  { name: 'Ferraille legere', defaultValue: '' },
  { name: 'Feraille & bois sortie broyeur', defaultValue: '' },
  { name: 'Inox', defaultValue: '' },
  { name: 'Inerte', defaultValue: '' },
  { name: 'Pneus', defaultValue: '' },
  { name: 'Sagex', defaultValue: '' },
  { name: 'Verre plat (vitrage)', defaultValue: '' },
  { name: 'Verre bouteilles', defaultValue: '' },
  { name: 'Piles usagées', defaultValue: '' },
  { name: 'Batteries & Accus', defaultValue: '' },
  { name: 'Extincteurs', defaultValue: '' },
  { name: 'Néons', defaultValue: '' },
  { name: 'Moteurs', defaultValue: '' },
  { name: 'Câbles', defaultValue: '' },
  { name: 'Sens. Electromager petit', defaultValue: '' },
  { name: 'Swico Informatique', defaultValue: '' },
  { name: 'SENS. Machines/ four', defaultValue: '' },
  { name: 'Sens. Frigos', defaultValue: '' },
  { name: 'Déchets organiques', defaultValue: '' },
  { name: 'Textils', defaultValue: '' },
  { name: 'Biométhanisation', defaultValue: '' },
  { name: 'Huile minéral', defaultValue: '' },
  { name: 'Huile végétal', defaultValue: '' },
  { name: 'Bois à problème broyé', defaultValue: '' },
  { name: 'PET en balle', defaultValue: '' },
  { name: 'Alu en balle', defaultValue: '' },
];

const clientReturns = [
  { name: 'Retour Manor', defaultValue: '' },
  { name: 'Retrour Bell', defaultValue: '' },
  { name: 'Retour Ikéa', defaultValue: '5 châssis' },
  { name: 'Retour swissport', defaultValue: '5 châssis' },
];

// Styles pour le PDF
const styles = StyleSheet.create({
  page: {
    padding: 10,
    fontSize: 8,
    backgroundColor: 'white',
  },
  header: {
    marginBottom: 5,
  },
  headerTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    backgroundColor: '#e8e8e8',
    padding: 3,
  },
  headerDate: {
    marginTop: 2,
    fontSize: 8,
  },
  table: {
    display: 'table',
    width: 'auto',
    marginBottom: 5,
    borderWidth: 0.5,
    borderColor: '#000',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 0.5,
    borderBottomColor: '#000',
    minHeight: 12,
  },
  tableHeader: {
    backgroundColor: '#e8e8e8',
  },
  tableCell: {
    borderRightWidth: 0.5,
    borderRightColor: '#000',
    padding: 2,
    justifyContent: 'center',
  },
  tableCellFirst: {
    width: '20%',
  },
  tableCellOther: {
    width: '10%',
    textAlign: 'center',
  },
  clientReturnsTitle: {
    marginTop: 5,
    marginBottom: 2,
    borderBottomWidth: 0.5,
    borderBottomColor: '#000',
    paddingBottom: 1,
    fontSize: 10,
    fontWeight: 'bold',
  },
  clientReturnsRow: {
    marginBottom: 2,
  },
});

// Composant PDF
const PDFDocument = ({ data }: { data: any }) => (
  <Document>
    <Page size="A4" orientation="landscape" style={styles.page}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Centre de tri</Text>
        <Text style={styles.headerDate}>
          Relevé du: {new Date().toLocaleDateString('fr-FR', { 
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}
        </Text>
      </View>

      <View style={styles.table}>
        <View style={[styles.tableRow, styles.tableHeader]}>
          <View style={[styles.tableCell, styles.tableCellFirst]}>
            <Text>Type de bennes</Text>
          </View>
          <View style={[styles.tableCell, styles.tableCellOther]}>
            <Text>7m3</Text>
          </View>
          <View style={[styles.tableCell, styles.tableCellOther]}>
            <Text>10m3</Text>
          </View>
          <View style={[styles.tableCell, styles.tableCellOther]}>
            <Text>20m3</Text>
          </View>
          <View style={[styles.tableCell, styles.tableCellOther]}>
            <Text>36m3</Text>
          </View>
          <View style={[styles.tableCell, styles.tableCellOther]}>
            <Text>24m3 compacteur</Text>
          </View>
          <View style={[styles.tableCell, styles.tableCellOther]}>
            <Text>en benne</Text>
          </View>
          <View style={[styles.tableCell, styles.tableCellOther]}>
            <Text>en vrac estimé</Text>
          </View>
          <View style={[styles.tableCell, styles.tableCellOther]}>
            <Text>A vider sur site</Text>
          </View>
        </View>

        {binTypes.map((item, index) => (
          <View key={index} style={styles.tableRow}>
            <View style={[styles.tableCell, styles.tableCellFirst]}>
              <Text>{item.name}</Text>
            </View>
            <View style={[styles.tableCell, styles.tableCellOther]}>
              <Text>{data[`${item.name}_7m3`] || ''}</Text>
            </View>
            <View style={[styles.tableCell, styles.tableCellOther]}>
              <Text>{data[`${item.name}_10m3`] || ''}</Text>
            </View>
            <View style={[styles.tableCell, styles.tableCellOther]}>
              <Text>{data[`${item.name}_20m3`] || ''}</Text>
            </View>
            <View style={[styles.tableCell, styles.tableCellOther]}>
              <Text>{data[`${item.name}_36m3`] || ''}</Text>
            </View>
            <View style={[styles.tableCell, styles.tableCellOther]}>
              <Text>{data[`${item.name}_24m3`] || ''}</Text>
            </View>
            <View style={[styles.tableCell, styles.tableCellOther]}>
              <Text>{data[`${item.name}_benne`] || ''}</Text>
            </View>
            <View style={[styles.tableCell, styles.tableCellOther]}>
              <Text>{data[`${item.name}_vrac`] || ''}</Text>
            </View>
            <View style={[styles.tableCell, styles.tableCellOther]}>
              <Text>{data[`${item.name}_vider`] || ''}</Text>
            </View>
          </View>
        ))}
      </View>

      <View>
        <Text style={styles.clientReturnsTitle}>Retour matériel client</Text>
        {clientReturns.map((item, index) => (
          <View key={index} style={styles.clientReturnsRow}>
            <Text>{item.name}: {data[`${item.name}`] || item.defaultValue}</Text>
          </View>
        ))}
      </View>
    </Page>
  </Document>
);

export function SortingSheet({ user, signOut }: SortingSheetProps) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<Record<string, string>>({});
  const currentDate = new Date().toLocaleDateString('fr-FR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleInputChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-green-600 text-white shadow-lg fixed top-0 left-0 right-0 z-50">
        <div className="container mx-auto px-4 py-3">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex items-center gap-2">
              <Package className="h-6 w-6" />
              <h1 className="text-xl font-bold">Centre de tri</h1>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/')}
                className="flex items-center gap-2 px-4 py-2 bg-green-700 hover:bg-green-800 rounded-md transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
                Retour
              </button>
              <PDFDownloadLink
                document={<PDFDocument data={formData} />}
                fileName={`centre-de-tri-${new Date().toISOString().split('T')[0]}.pdf`}
                className="flex items-center gap-2 px-4 py-2 bg-green-700 hover:bg-green-800 rounded-md transition-colors"
              >
                <Download className="h-5 w-5" />
                <span className="hidden sm:inline">Exporter PDF</span>
              </PDFDownloadLink>
              {user && (
                <>
                  <div className="hidden sm:flex items-center gap-1 text-sm">
                    <div className="w-2 h-2 bg-green-300 rounded-full"></div>
                    <span>{user.email}</span>
                  </div>
                  <button
                    onClick={handleSignOut}
                    className="p-2 hover:bg-green-700 rounded-full transition-colors"
                  >
                    <LogOut className="h-5 w-5" />
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 pt-24 pb-6">
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-800">Centre de tri</h2>
            <p className="text-sm text-gray-600">Relevé du: {currentDate}</p>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type de bennes</th>
                  <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">7m3</th>
                  <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">10m3</th>
                  <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">20m3</th>
                  <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">36m3</th>
                  <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">24m3 compacteur</th>
                  <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">en benne</th>
                  <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">en vrac estimé</th>
                  <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">A vider sur site</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {binTypes.map((item, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                      {item.name}
                    </td>
                    {['7m3', '10m3', '20m3', '36m3', '24m3', 'benne', 'vrac', 'vider'].map((size) => (
                      <td key={size} className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                        <input
                          type="text"
                          className="w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm"
                          value={formData[`${item.name}_${size}`] || ''}
                          onChange={(e) => handleInputChange(`${item.name}_${size}`, e.target.value)}
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="mt-8">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Retour matériel client</h3>
              {clientReturns.map((item, index) => (
                <div key={index} className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">
                    {item.name}
                  </label>
                  <input
                    type="text"
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm"
                    value={formData[item.name] || item.defaultValue}
                    onChange={(e) => handleInputChange(item.name, e.target.value)}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
