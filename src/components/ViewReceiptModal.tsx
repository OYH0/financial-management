
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { X } from 'lucide-react';

interface ViewReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  receiptPath: string;
  transactionDescription: string;
}

const ViewReceiptModal: React.FC<ViewReceiptModalProps> = ({ 
  isOpen, 
  onClose, 
  receiptPath, 
  transactionDescription 
}) => {
  const [receiptUrl, setReceiptUrl] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (isOpen && receiptPath) {
      loadReceipt();
    }
  }, [isOpen, receiptPath]);

  const loadReceipt = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('Loading receipt:', receiptPath);
      
      const { data, error } = await supabase.storage
        .from('receipts')
        .createSignedUrl(receiptPath, 3600); // URL válida por 1 hora

      if (error) {
        console.error('Error creating signed URL:', error);
        throw error;
      }

      if (data?.signedUrl) {
        setReceiptUrl(data.signedUrl);
      } else {
        throw new Error('Não foi possível gerar a URL do comprovante');
      }
    } catch (err) {
      console.error('Error loading receipt:', err);
      setError('Erro ao carregar o comprovante');
    } finally {
      setIsLoading(false);
    }
  };

  const isImage = receiptPath?.toLowerCase().match(/\.(jpg|jpeg|png|gif|webp)$/i);
  const isPdf = receiptPath?.toLowerCase().endsWith('.pdf');

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-gray-900">
            Comprovante - {transactionDescription}
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 overflow-auto">
          {isLoading && (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
              <span className="ml-3 text-gray-600">Carregando comprovante...</span>
            </div>
          )}

          {error && (
            <div className="flex items-center justify-center py-12 text-red-600">
              <p>{error}</p>
            </div>
          )}

          {receiptUrl && !isLoading && !error && (
            <div className="space-y-4">
              {isImage && (
                <div className="text-center">
                  <img 
                    src={receiptUrl} 
                    alt="Comprovante" 
                    className="max-w-full max-h-[70vh] object-contain mx-auto rounded-lg shadow-lg"
                    onError={() => setError('Erro ao carregar a imagem')}
                  />
                </div>
              )}

              {isPdf && (
                <div className="h-[70vh]">
                  <iframe 
                    src={receiptUrl} 
                    className="w-full h-full border rounded-lg"
                    title="Comprovante PDF"
                  />
                </div>
              )}

              {!isImage && !isPdf && (
                <div className="text-center py-8">
                  <p className="text-gray-600 mb-4">
                    Tipo de arquivo não suportado para visualização
                  </p>
                  <a 
                    href={receiptUrl} 
                    download 
                    className="inline-flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    Baixar Arquivo
                  </a>
                </div>
              )}

              <div className="flex justify-center pt-4">
                <a 
                  href={receiptUrl} 
                  download 
                  className="inline-flex items-center px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Baixar Comprovante
                </a>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ViewReceiptModal;
