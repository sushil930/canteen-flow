import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { OrderContext } from '@/contexts/OrderContext';
import { ArrowLeft } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import Header from '@/components/Header';

interface Table {
  id: number;
  number: number;
  seats: number;
}

const TableSelection = () => {
  const { canteenId } = useParams<{ canteenId: string }>();
  const navigate = useNavigate();
  const { setTableNumber } = useContext(OrderContext);
  const [selectedTable, setSelectedTable] = useState<number | null>(null);
  const { toast } = useToast();

  // You can fetch real table data from your backend
  // For now using mock data that simulates API response
  const tablesQuery = useQuery<Table[], Error>({
    queryKey: ['tables', canteenId],
    queryFn: () => {
      // Replace with actual API call when backend is ready
      // return apiClient<Table[]>(`/canteens/${canteenId}/tables/`);

      // Mock data for 20 tables
      const mockTables: Table[] = Array.from({ length: 20 }, (_, i) => ({
        id: i + 1,
        number: i + 1,
        seats: [2, 4, 6, 8][Math.floor(Math.random() * 4)], // Random seat count
      }));
      return Promise.resolve(mockTables);
    },
  });

  const handleContinue = () => {
    if (selectedTable === null) {
      toast({
        title: "No Table Selected",
        description: "Please select a table to continue.",
        variant: "destructive",
      });
      return;
    }

    setTableNumber(selectedTable.toString());
    navigate('/menu');
  };

  const handleSelectTable = (table: Table) => {
    setSelectedTable(table.number);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />

      <main className="flex-grow container mx-auto px-4 py-8 max-w-4xl">
        <Link to="/" className="inline-flex items-center text-gray-600 mb-6 hover:text-gray-900 transition-colors">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Home
        </Link>

        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Select Your Table</h1>
          <p className="text-gray-600">Choose an available table for your dining experience</p>
        </div>

        {tablesQuery.isLoading ? (
          <div className="flex justify-center py-12">
            <div className="h-6 w-6 border-t-2 border-primary rounded-full animate-spin"></div>
          </div>
        ) : tablesQuery.isError ? (
          <div className="p-4 text-red-600 bg-red-50 rounded-lg text-center">
            Error loading tables: {tablesQuery.error.message}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-8">
              {tablesQuery.data.map((table) => (
                <button
                  key={table.id}
                  onClick={() => handleSelectTable(table)}
                  className={`
                    h-24 rounded-lg border transition-all flex flex-col items-center justify-center
                    ${selectedTable === table.number
                      ? 'bg-[#ff6433] text-white border-[#ff6433]'
                      : 'bg-white hover:shadow-md border-gray-200'
                    }
                  `}
                >
                  <span className={`text-2xl font-bold ${selectedTable === table.number ? 'text-white' : 'text-gray-800'}`}>
                    #{table.number}
                  </span>
                  <span className={`text-sm ${selectedTable === table.number ? 'text-white/90' : 'text-gray-500'}`}>
                    {table.seats} seats
                  </span>
                </button>
              ))}
            </div>

            <div className="flex justify-end">
              <Button
                onClick={handleContinue}
                disabled={selectedTable === null}
                className="bg-[#ff6433] hover:bg-[#e05a2d] text-white"
              >
                Continue to Menu
              </Button>
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default TableSelection;
