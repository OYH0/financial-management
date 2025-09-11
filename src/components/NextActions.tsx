import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, CheckCircle, Clock, Plus, Trash2, Edit } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Action {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  priority: 'low' | 'medium' | 'high';
  completed: boolean;
  icon: string;
}

interface NextActionsProps {
  empresa: string;
}

const NextActions: React.FC<NextActionsProps> = ({ empresa }) => {
  const [actions, setActions] = useState<Action[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAction, setEditingAction] = useState<Action | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    dueDate: '',
    priority: 'medium' as 'low' | 'medium' | 'high'
  });

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'calendar':
        return <Calendar className="h-4 w-4 text-gray-600" />;
      case 'edit':
        return <Edit className="h-4 w-4 text-gray-600" />;
      case 'clock':
        return <Clock className="h-4 w-4 text-gray-600" />;
      default:
        return <Calendar className="h-4 w-4 text-gray-600" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'border-l-red-500 bg-red-50';
      case 'medium':
        return 'border-l-yellow-500 bg-yellow-50';
      case 'low':
        return 'border-l-green-500 bg-green-50';
      default:
        return 'border-l-gray-500 bg-gray-50';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const isOverdue = (dateString: string) => {
    return new Date(dateString) < new Date();
  };

  const handleAddAction = () => {
    setEditingAction(null);
    setFormData({ title: '', description: '', dueDate: '', priority: 'medium' });
    setIsDialogOpen(true);
  };

  const handleEditAction = (action: Action) => {
    setEditingAction(action);
    setFormData({
      title: action.title,
      description: action.description,
      dueDate: action.dueDate,
      priority: action.priority
    });
    setIsDialogOpen(true);
  };

  const handleSaveAction = () => {
    if (editingAction) {
      setActions(actions.map(action => 
        action.id === editingAction.id 
          ? { ...action, ...formData }
          : action
      ));
    } else {
      const newAction: Action = {
        id: Date.now().toString(),
        ...formData,
        completed: false,
        icon: 'calendar'
      };
      setActions([...actions, newAction]);
    }
    setIsDialogOpen(false);
  };

  const handleDeleteAction = (id: string) => {
    setActions(actions.filter(action => action.id !== id));
  };

  const handleToggleComplete = (id: string) => {
    setActions(actions.map(action => 
      action.id === id 
        ? { ...action, completed: !action.completed }
        : action
    ));
  };

  const activeActions = actions.filter(action => !action.completed);
  const completedActions = actions.filter(action => action.completed);

  return (
    <Card className="bg-white/80 backdrop-blur-sm border-white/20 shadow-xl rounded-2xl">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl text-gray-800">Próximas Ações</CardTitle>
            <CardDescription>Tarefas pendentes</CardDescription>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleAddAction}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Adicionar
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {activeActions.length === 0 && completedActions.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Calendar className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm">Nenhuma ação adicionada ainda.</p>
            <p className="text-xs mt-1">Clique em "Adicionar" para criar sua primeira ação.</p>
          </div>
        ) : (
          <>
            {activeActions.map((action) => (
              <div 
                key={action.id} 
                className={`flex items-start gap-3 p-3 rounded-xl border-l-4 ${getPriorityColor(action.priority)}`}
              >
                {getIcon(action.icon)}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-sm font-medium">{action.title}</p>
                    {isOverdue(action.dueDate) && (
                      <span className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded-full">
                        Atrasado
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-600 mb-1">{action.description}</p>
                  <p className="text-xs text-gray-500">Até {formatDate(action.dueDate)}</p>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleToggleComplete(action.id)}
                    className="h-6 w-6 p-0"
                  >
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEditAction(action)}
                    className="h-6 w-6 p-0"
                  >
                    <Edit className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteAction(action.id)}
                    className="h-6 w-6 p-0"
                  >
                    <Trash2 className="h-3 w-3 text-red-500" />
                  </Button>
                </div>
              </div>
            ))}

            {completedActions.length > 0 && (
              <div className="pt-3 border-t border-gray-200">
                <p className="text-sm font-medium text-gray-600 mb-2">Concluídas</p>
                {completedActions.map((action) => (
                  <div 
                    key={action.id} 
                    className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg opacity-60"
                  >
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <div className="flex-1">
                      <p className="text-sm line-through">{action.title}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleToggleComplete(action.id)}
                      className="h-6 w-6 p-0"
                    >
                      <Clock className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingAction ? 'Editar Ação' : 'Nova Ação'}
              </DialogTitle>
              <DialogDescription>
                {editingAction ? 'Edite os detalhes da ação' : 'Adicione uma nova ação à lista'}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Título</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Ex: Reunião com cliente"
                />
              </div>
              <div>
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Detalhes da ação..."
                />
              </div>
              <div>
                <Label htmlFor="dueDate">Data Limite</Label>
                <Input
                  id="dueDate"
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="priority">Prioridade</Label>
                <Select value={formData.priority} onValueChange={(value: 'low' | 'medium' | 'high') => setFormData({ ...formData, priority: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Baixa</SelectItem>
                    <SelectItem value="medium">Média</SelectItem>
                    <SelectItem value="high">Alta</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSaveAction}>
                {editingAction ? 'Salvar' : 'Adicionar'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default NextActions;
