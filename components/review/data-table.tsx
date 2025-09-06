"use client";

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { EditableCell } from './editable-cell';
import { DateCell } from './date-cell';
import { TypeSelect } from './type-select';
import { ConfidenceBadge } from './confidence-badge';
import { DataTableToolbar } from './data-table-toolbar';
import { cn, formatDate } from '@/lib/utils';
import { Trash2, Plus } from 'lucide-react';

interface DataTableProps {
  data: any[];
  syllabusId: string;
}

export function DataTable({ data, syllabusId }: DataTableProps) {
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [sortColumn, setSortColumn] = useState<string>('dueDate');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [filterType, setFilterType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const queryClient = useQueryClient();

  const updateItemMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const response = await fetch(`/api/items/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Update failed');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['syllabus', syllabusId] });
    },
  });

  const deleteItemMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/items/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Delete failed');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['syllabus', syllabusId] });
      setSelectedRows(new Set());
    },
  });

  // Filter and sort data
  const filteredData = data
    .filter(item => {
      if (filterType !== 'all' && item.type !== filterType) return false;
      if (searchQuery && !item.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      return true;
    })
    .sort((a, b) => {
      let aVal = a[sortColumn];
      let bVal = b[sortColumn];
      
      if (sortColumn === 'dueDate') {
        aVal = aVal ? new Date(aVal).getTime() : 0;
        bVal = bVal ? new Date(bVal).getTime() : 0;
      }
      
      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

  // Separate low confidence items and pin to top
  const lowConfidenceItems = filteredData.filter(item => item.confidence < 0.8);
  const normalItems = filteredData.filter(item => item.confidence >= 0.8);
  const sortedData = [...lowConfidenceItems, ...normalItems];

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const handleRowSelect = (id: string, selected: boolean) => {
    const newSelected = new Set(selectedRows);
    if (selected) {
      newSelected.add(id);
    } else {
      newSelected.delete(id);
    }
    setSelectedRows(newSelected);
  };

  const handleSelectAll = (selected: boolean) => {
    if (selected) {
      setSelectedRows(new Set(sortedData.map(item => item.id)));
    } else {
      setSelectedRows(new Set());
    }
  };

  const handleBulkDelete = async () => {
    if (selectedRows.size === 0) return;
    
    const promises = Array.from(selectedRows).map(id => 
      deleteItemMutation.mutateAsync(id)
    );
    
    await Promise.all(promises);
  };

  const handleUpdateItem = (id: string, field: string, value: any) => {
    updateItemMutation.mutate({ id, data: { [field]: value } });
  };

  return (
    <div className="space-y-4">
      <DataTableToolbar
        selectedCount={selectedRows.size}
        totalCount={sortedData.length}
        onBulkDelete={handleBulkDelete}
        filterType={filterType}
        onFilterTypeChange={setFilterType}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onSelectAll={handleSelectAll}
        isDeletePending={deleteItemMutation.isPending}
      />

      <div className="border border-border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted">
              <tr>
                <th className="w-12 px-4 py-3">
                  <input
                    type="checkbox"
                    checked={selectedRows.size === sortedData.length && sortedData.length > 0}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="rounded border-border"
                  />
                </th>
                
                <th className="px-4 py-3 text-left">
                  <button
                    onClick={() => handleSort('title')}
                    className="font-medium text-fg hover:text-accent transition-colors"
                  >
                    Title
                    {sortColumn === 'title' && (
                      <span className="ml-1">
                        {sortDirection === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </button>
                </th>
                
                <th className="px-4 py-3 text-left">
                  <button
                    onClick={() => handleSort('type')}
                    className="font-medium text-fg hover:text-accent transition-colors"
                  >
                    Type
                    {sortColumn === 'type' && (
                      <span className="ml-1">
                        {sortDirection === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </button>
                </th>
                
                <th className="px-4 py-3 text-left">
                  <button
                    onClick={() => handleSort('dueDate')}
                    className="font-medium text-fg hover:text-accent transition-colors"
                  >
                    Due Date
                    {sortColumn === 'dueDate' && (
                      <span className="ml-1">
                        {sortDirection === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </button>
                </th>
                
                <th className="px-4 py-3 text-left">
                  <button
                    onClick={() => handleSort('weight')}
                    className="font-medium text-fg hover:text-accent transition-colors"
                  >
                    Weight
                    {sortColumn === 'weight' && (
                      <span className="ml-1">
                        {sortDirection === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </button>
                </th>
                
                <th className="px-4 py-3 text-left">Description</th>
                
                <th className="px-4 py-3 text-left">
                  <button
                    onClick={() => handleSort('confidence')}
                    className="font-medium text-fg hover:text-accent transition-colors"
                  >
                    Confidence
                    {sortColumn === 'confidence' && (
                      <span className="ml-1">
                        {sortDirection === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </button>
                </th>
                
                <th className="w-12 px-4 py-3"></th>
              </tr>
            </thead>
            
            <tbody>
              {sortedData.map((item, index) => (
                <tr
                  key={item.id}
                  className={cn(
                    "border-t border-border hover:bg-muted/50 transition-colors",
                    item.confidence < 0.8 && "bg-yellow-50/50",
                    selectedRows.has(item.id) && "bg-accent/10"
                  )}
                >
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selectedRows.has(item.id)}
                      onChange={(e) => handleRowSelect(item.id, e.target.checked)}
                      className="rounded border-border"
                    />
                  </td>
                  
                  <td className="px-4 py-3">
                    <EditableCell
                      value={item.title}
                      onSave={(value) => handleUpdateItem(item.id, 'title', value)}
                      className="font-medium"
                    />
                  </td>
                  
                  <td className="px-4 py-3">
                    <TypeSelect
                      value={item.type}
                      onSave={(value) => handleUpdateItem(item.id, 'type', value)}
                    />
                  </td>
                  
                  <td className="px-4 py-3">
                    <DateCell
                      value={item.dueDate}
                      onSave={(value) => handleUpdateItem(item.id, 'dueDate', value)}
                    />
                  </td>
                  
                  <td className="px-4 py-3">
                    <EditableCell
                      value={item.weight?.toString() || ''}
                      onSave={(value) => handleUpdateItem(item.id, 'weight', value ? parseFloat(value) : null)}
                      placeholder="0"
                      type="number"
                    />
                  </td>
                  
                  <td className="px-4 py-3">
                    <EditableCell
                      value={item.description || ''}
                      onSave={(value) => handleUpdateItem(item.id, 'description', value || null)}
                      placeholder="Add description..."
                      multiline
                    />
                  </td>
                  
                  <td className="px-4 py-3">
                    <ConfidenceBadge confidence={item.confidence} />
                  </td>
                  
                  <td className="px-4 py-3">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteItemMutation.mutate(item.id)}
                      disabled={deleteItemMutation.isPending}
                      className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {sortedData.length === 0 && (
          <div className="text-center py-8 text-fg/60">
            No items match your current filters.
          </div>
        )}
      </div>
    </div>
  );
}
