
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CheckCircle, AlertTriangle, Wallet } from 'lucide-react';
import { Transaction } from '@/types/transaction';

interface MarkAsPaidModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: Transaction | null;
  onConfirm: (transaction: Transaction, paymentSource: 'cofre' | 'conta') => void;
}

const MarkAsPaidModal: React.FC<MarkAsPaidModalProps> = ({
  isOpen,
  onClose,
  transaction,
  onConfirm
}) => {
  const [paymentSource, setPaymentSource] = useState<'cofre' | 'conta'>('conta');
  
  if (!transaction) return null;

  const handleConfirm = () => {
    onConfirm(transaction, paymentSource);
    onClose();
  };

  const getCurrentDate = () => {
    const today = new Date();
    return today.toLocaleDateString('pt-BR');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            Confirmar Pagamento
          </DialogTitle>
          <DialogDescription>
            Você tem certeza que deseja marcar esta despesa como paga?
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          <div className="bg-gray-50 rounded-lg p-4 space-y-2">
            <div className="flex justify-between">
              <span className="font-medium text-gray-700">Descrição:</span>
              <span className="text-gray-900">{transaction.description}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium text-gray-700">Empresa:</span>
              <span className="text-gray-900">{transaction.company}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium text-gray-700">Valor:</span>
              <span className="text-gray-900 font-bold">
                R$ {(transaction.valor_total || transaction.valor).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium text-gray-700">Data do Pagamento:</span>
              <span className="text-green-600 font-medium">{getCurrentDate()}</span>
            </div>
          </div>
          
          <div className="mt-4 space-y-3">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Forma de Pagamento:
              </label>
              <Select value={paymentSource} onValueChange={(value: 'cofre' | 'conta') => setPaymentSource(value)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecione a forma de pagamento" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="conta">
                    <div className="flex items-center gap-2">
                      <Wallet className="h-4 w-4" />
                      Dinheiro em Conta
                    </div>
                  </SelectItem>
                  <SelectItem value="cofre">
                    <div className="flex items-center gap-2">
                      <Wallet className="h-4 w-4" />
                      Dinheiro em Cofre
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5" />
                <div className="text-sm text-yellow-800">
                  <p className="font-medium">Atenção:</p>
                  <p>Esta ação marcará a despesa como paga.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button 
            onClick={handleConfirm}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            Confirmar Pagamento
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default MarkAsPaidModal;
