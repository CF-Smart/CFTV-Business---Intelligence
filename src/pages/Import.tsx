import React, { useState } from 'react';
import { Upload, FileSpreadsheet, CheckCircle, AlertCircle, Calendar, Trash2 } from 'lucide-react';
import * as XLSX from 'xlsx';
import { useDataStore, ImportedFile, ContractData, ServiceData, SaleData, FinancialData } from '../hooks/useDataStore';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../supabaseClient';

const Import: React.FC = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [importedFiles, setImportedFiles] = useState<any[]>([]);
  const { user } = useAuth();
  const { 
    data, 
    addContracts, 
    addServices, 
    addSales, 
    addFinancial, 
    addImportedFile,
    removeImportedFile,
    removeImportedFileAndData
  } = useDataStore();

  // Buscar arquivos importados do Supabase
  const fetchImportedFiles = async () => {
    try {
      const { data, error } = await supabase.from('imported_files').select('*').order('date', { ascending: false });
      if (error) throw error;
      setImportedFiles(data || []);
    } catch (error) {
      console.error('Erro ao buscar arquivos importados:', error);
    }
  };

  // Carregar arquivos importados ao montar o componente
  React.useEffect(() => {
    fetchImportedFiles();
  }, []);

  // Só permite acesso ao upload se for o admin
  if (!user || user.email !== 'cfsmart@cfcontabilidade.com') {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8">
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-6 rounded-lg max-w-md text-center">
          <h2 className="text-xl font-bold mb-2">Acesso restrito</h2>
          <p>Apenas o usuário <b>CF Smart</b> pode importar ou atualizar os dados do sistema.<br/>Entre em contato com o administrador para solicitar atualizações.</p>
        </div>
      </div>
    );
  }

  const detectFileType = (headers: string[]): string => {
    const headerStr = headers.join('|').toLowerCase();
    
    // Contratos: Nome Cliente + Valor Total
    if (headerStr.includes('nome cliente') && headerStr.includes('valor total') && !headerStr.includes('situacao')) {
      return 'contracts';
    }
    // Serviços: Cliente (Nome Fantasia) + Valor Total
    if ((headerStr.includes('cliente (nome fantasia)') || headerStr.includes('cliente nome fantasia')) && headerStr.includes('valor total')) {
      return 'services';
    }
    // Vendas: Cliente Nome Fantasia + Total da Nota Fiscal
    if (headerStr.includes('cliente nome fantasia') && headerStr.includes('total da nota fiscal')) {
      return 'sales';
    }
    // Financeiro: Situação + Categoria + Saldo (para orçamento)
    if (headerStr.includes('situacao') && (headerStr.includes('categoria') || headerStr.includes('conta')) && (headerStr.includes('saldo') || headerStr.includes('valor'))) {
      return 'financial';
    }
    
    return 'unknown';
  };

  const parseExcelFile = async (file: File): Promise<{ type: string; data: any[]; records: number }> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];
          
          if (jsonData.length < 2) {
            reject(new Error('Arquivo deve ter pelo menos 2 linhas (cabeçalho + dados)'));
            return;
          }

          const headers = jsonData[0] as string[];
          const rows = jsonData.slice(1);
          const fileType = detectFileType(headers);

          if (fileType === 'unknown') {
            reject(new Error('Formato de arquivo não reconhecido'));
            return;
          }

          let parsedData: any[] = [];

          switch (fileType) {
            case 'contracts':
              parsedData = rows.map(row => ({
                cliente: String(row[0] || '').trim(),
                valor: parseFloat(String(row[1] || '0').replace(/[^\d.-]/g, '')) || 0,
                data: String(row[2] || '')
              })).filter(item => item.cliente && item.valor > 0);
              break;

            case 'services':
              parsedData = rows.map(row => ({
                cliente: String(row[0] || '').trim(),
                data: String(row[1] || ''),
                valor: parseFloat(String(row[2] || '0').replace(/[^\d.-]/g, '')) || 0
              })).filter(item => item.cliente && item.valor > 0);
              break;

            case 'sales':
              parsedData = rows.map(row => ({
                cliente: String(row[0] || '').trim(),
                data: String(row[1] || ''),
                valor: parseFloat(String(row[2] || '0').replace(/[^\d.-]/g, '')) || 0
              })).filter(item => item.cliente && item.valor > 0);
              break;

            case 'financial':
              parsedData = rows.map(row => ({
                situacao: String(row[0] || '').trim(),
                data: String(row[1] || ''),
                cliente: String(row[2] || '').trim(),
                conta: String(row[3] || '').trim(),
                categoria: String(row[4] || '').trim(),
                valor: parseFloat(String(row[5] || '0').replace(/[^\d.-]/g, '')) || 0,
                saldo: parseFloat(String(row[6] || '0').replace(/[^\d.-]/g, '')) || 0
              })).filter(item => item.cliente && item.valor !== 0);
              break;
          }

          resolve({
            type: fileType,
            data: parsedData,
            records: parsedData.length
          });

        } catch (error) {
          reject(new Error('Erro ao processar arquivo Excel'));
        }
      };

      reader.onerror = () => reject(new Error('Erro ao ler arquivo'));
      reader.readAsArrayBuffer(file);
    });
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);

    for (const file of Array.from(files)) {
      try {
        const result = await parseExcelFile(file);
        let insertResult;
        let importedFileId = undefined;

        // Salvar arquivo importado primeiro para obter o id
        const { data: importedFileData, error: importedFileError } = await supabase.from('imported_files').insert([
          {
            name: file.name,
            type: getFileTypeLabel(result.type),
            size: `${Math.round(file.size / 1024)} KB`,
            date: new Date().toLocaleDateString('pt-BR'),
            status: 'success',
            records: result.records
          }
        ]).select('id');
        if (importedFileError) throw importedFileError;
        importedFileId = importedFileData && importedFileData[0]?.id;

        // Salvar os dados na tabela correspondente
        switch (result.type) {
          case 'contracts':
            insertResult = await supabase.from('contracts').insert(
              result.data.map((item: any) => ({ ...item, imported_file_id: importedFileId }))
            );
            break;
          case 'services':
            insertResult = await supabase.from('services').insert(
              result.data.map((item: any) => ({ ...item, imported_file_id: importedFileId }))
            );
            break;
          case 'sales':
            insertResult = await supabase.from('sales').insert(
              result.data.map((item: any) => ({ ...item, imported_file_id: importedFileId }))
            );
            break;
          case 'financial':
            insertResult = await supabase.from('financial').insert(
              result.data.map((item: any) => ({ ...item, imported_file_id: importedFileId }))
            );
            break;
        }
        // (Opcional) Você pode tratar insertResult.error aqui se quiser mostrar erro específico
      } catch (error) {
        console.error('Erro ao processar arquivo:', error);
        // (Opcional) Salvar arquivo com status de erro no Supabase
        await supabase.from('imported_files').insert([
          {
            name: file.name,
            type: 'Erro',
            size: `${Math.round(file.size / 1024)} KB`,
            date: new Date().toLocaleDateString('pt-BR'),
            status: 'error',
            records: 0
          }
        ]);
      }
    }

      setIsUploading(false);
  // Limpar input
  event.target.value = '';
  // Atualizar a lista de arquivos importados
  fetchImportedFiles();
};

  const getFileTypeLabel = (type: string): string => {
    const labels = {
      contracts: 'Contratos',
      services: 'Faturamento Serviços',
      sales: 'Vendas',
      financial: 'Extratos Financeiros'
    };
    return labels[type as keyof typeof labels] || 'Desconhecido';
  };

  const getStatusIcon = (status: 'success' | 'error') => {
    return status === 'success' 
      ? <CheckCircle className="w-5 h-5 text-green-500" />
      : <AlertCircle className="w-5 h-5 text-red-500" />;
  };

  const getStatusBadge = (status: 'success' | 'error') => {
    return status === 'success' 
      ? <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">Sucesso</span>
      : <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded-full">Erro</span>;
  };

  const removeFile = async (fileId: string) => {
    const file = importedFiles.find(f => f.id === fileId);
    if (!file) return;
    
    const confirmed = window.confirm(
      `Tem certeza que deseja excluir "${file.name}"?\n\n` +
      `Isso também removerá TODOS os dados do tipo "${file.type}" do sistema.\n` +
      `Esta ação não pode ser desfeita.`
    );
    
    if (confirmed) {
      try {
        // Remover dados relacionados
        switch (file.type.toLowerCase()) {
          case 'contratos':
            await supabase.from('contracts').delete().eq('imported_file_id', fileId);
            break;
          case 'faturamento serviços':
            await supabase.from('services').delete().eq('imported_file_id', fileId);
            break;
          case 'vendas':
            await supabase.from('sales').delete().eq('imported_file_id', fileId);
            break;
          case 'extratos financeiros':
            await supabase.from('financial').delete().eq('imported_file_id', fileId);
            break;
        }
        // Remover arquivo
        await supabase.from('imported_files').delete().eq('id', fileId);
        // Atualizar lista
        fetchImportedFiles();
      } catch (error) {
        console.error('Erro ao remover arquivo:', error);
      }
    }
  };

  const successfulImports = importedFiles.filter(f => f.status === 'success').length;
  const failedImports = importedFiles.filter(f => f.status === 'error').length;
  const totalRecords = importedFiles.reduce((sum, f) => sum + f.records, 0);

  return (
    <div className="space-y-6">
      {/* Upload Section */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center space-x-3 mb-6">
          <Upload className="w-8 h-8 text-blue-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Importação de Arquivos</h1>
            <p className="text-gray-600">Faça upload dos arquivos Excel com dados financeiros</p>
          </div>
        </div>

        {/* Upload Area */}
        <div className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          isUploading ? 'border-blue-400 bg-blue-50' : 'border-gray-300 hover:border-blue-400'
        }`}>
          <input
            type="file"
            multiple
            accept=".xlsx,.xls"
            onChange={handleFileUpload}
            className="hidden"
            id="file-upload"
            disabled={isUploading}
          />
          <label htmlFor="file-upload" className={`cursor-pointer ${isUploading ? 'pointer-events-none' : ''}`}>
            <FileSpreadsheet className={`w-16 h-16 mx-auto mb-4 ${isUploading ? 'text-blue-500 animate-pulse' : 'text-gray-400'}`} />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {isUploading ? 'Processando arquivos...' : 'Clique para selecionar arquivos'}
            </h3>
            <p className="text-gray-600 mb-4">
              {isUploading ? 'Aguarde enquanto processamos seus dados' : 'Ou arraste e solte arquivos Excel aqui'}
            </p>
            {!isUploading && (
              <div className="bg-blue-600 text-white px-6 py-3 rounded-lg inline-block hover:bg-blue-700 transition-colors">
                Selecionar Arquivos
              </div>
            )}
          </label>
        </div>

        {/* File Type Guidelines */}
        <div className="mt-6 bg-blue-50 rounded-lg p-4">
          <h4 className="font-semibold text-blue-900 mb-2">Formatos aceitos:</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• <strong>Contratos:</strong> Nome Cliente | Valor Total | Data → <span className="text-blue-600">Alimenta cards do Dashboard</span></li>
            <li>• <strong>Serviços:</strong> Cliente (Nome Fantasia) | Data de emissão | Valor total → <span className="text-blue-600">Alimenta cards do Dashboard</span></li>
            <li>• <strong>Vendas:</strong> Cliente Nome Fantasia | Data de emissão | Total da nota fiscal → <span className="text-blue-600">Alimenta cards do Dashboard</span></li>
            <li>• <strong>Extrato Financeiro:</strong> Situação | Data | Cliente/Fornecedor | Conta | Categoria | Valor | Saldo → <span className="text-green-600">Alimenta página de Orçamento</span></li>
          </ul>
          <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded">
            <p className="text-xs text-yellow-800">
              <strong>Separação de dados:</strong> Contratos/Serviços/Vendas → Dashboard | Extratos Financeiros → Orçamento
            </p>
          </div>
        </div>
      </div>

      {/* Imported Files */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-900">Arquivos Importados</h2>
          <p className="text-gray-600 text-sm mt-1">Histórico de todos os arquivos processados</p>
        </div>

        {/* Files List */}
        <div className="space-y-4">
          {importedFiles.length > 0 ? importedFiles.map((file) => (
            <div key={file.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  {getStatusIcon(file.status)}
                  <div>
                    <h4 className="font-medium text-gray-900">{file.name}</h4>
                    <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                      <span>{file.type}</span>
                      <span>•</span>
                      <span>{file.size}</span>
                      <span>•</span>
                      <span>{file.date}</span>
                      <span>•</span>
                      <span>{file.records} registros</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  {getStatusBadge(file.status)}
                  <button 
                    onClick={() => removeFile(file.id)}
                    className="text-red-500 hover:text-red-700 p-2 rounded-lg hover:bg-red-50 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )) : (
            <div className="text-center py-8">
              <FileSpreadsheet className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600">Nenhum arquivo importado ainda</p>
              <p className="text-sm text-gray-500">Faça upload de arquivos Excel para começar</p>
            </div>
          )}
        </div>
      </div>

      {/* Import Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-green-500 to-green-600 p-6 rounded-xl text-white">
          <CheckCircle className="w-8 h-8 mb-2 opacity-80" />
          <h3 className="text-sm font-medium opacity-90">Importações Bem-sucedidas</h3>
          <p className="text-2xl font-bold">{successfulImports}</p>
          <span className="text-xs opacity-75">
            {successfulImports === 0 ? 'Aguardando importações' : 'Arquivos processados'}
          </span>
        </div>
        
        <div className="bg-gradient-to-br from-red-500 to-red-600 p-6 rounded-xl text-white">
          <AlertCircle className="w-8 h-8 mb-2 opacity-80" />
          <h3 className="text-sm font-medium opacity-90">Falhas na Importação</h3>
          <p className="text-2xl font-bold">{failedImports}</p>
          <span className="text-xs opacity-75">
            {failedImports === 0 ? 'Nenhuma falha' : 'Arquivos com erro'}
          </span>
        </div>
        
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-xl text-white">
          <FileSpreadsheet className="w-8 h-8 mb-2 opacity-80" />
          <h3 className="text-sm font-medium opacity-90">Total de Registros</h3>
          <p className="text-2xl font-bold">{totalRecords}</p>
          <span className="text-xs opacity-75">
            {totalRecords === 0 ? 'Aguardando dados' : 'Registros importados'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default Import;