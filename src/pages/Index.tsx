import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Utensils, Building, ArrowRight } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { OrderContext } from '@/contexts/OrderContext';
import { motion } from "framer-motion";
import Header from '@/components/Header';

interface ApiCanteen {
  id: number;
  name: string;
  description: string;
}

const Index = () => {
  const navigate = useNavigate();
  const { setSelectedCanteenId } = useContext(OrderContext);

  const canteensQuery = useQuery<ApiCanteen[], Error>({
    queryKey: ['canteens'],
    queryFn: () => apiClient<ApiCanteen[]>('/canteens/'),
  });

  const handleSelectCanteen = (canteenId: number) => {
    setSelectedCanteenId(canteenId);
    navigate(`/canteen/${canteenId}/table`);
  };

  if (canteensQuery.isLoading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-white">
        <div className="h-5 w-5 border-t-2 border-primary rounded-full animate-spin mb-4"></div>
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  if (canteensQuery.isError) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white p-4">
        <p className="text-red-500 mb-4">Something went wrong while loading canteens.</p>
        <button
          onClick={() => canteensQuery.refetch()}
          className="px-4 py-2 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!canteensQuery.data || canteensQuery.data.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white p-4">
        <p className="text-gray-700">No canteens available at the moment.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-white text-gray-800">
      <Header />

      <main className="flex-grow flex flex-col items-center justify-center px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-3 text-[#ff6433]">
            Welcome to Canteen
          </h1>
          <p className="text-lg text-gray-600">
            Select a canteen to start your order
          </p>
        </motion.div>

        <div className="w-full max-w-md space-y-4">
          {canteensQuery.data.map((canteen, index) => (
            <motion.div
              key={canteen.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 * index }}
            >
              <button
                onClick={() => handleSelectCanteen(canteen.id)}
                className="w-full bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow border border-gray-100 flex items-center"
              >
                <div className="h-12 w-12 rounded-full bg-[#fff3ee] flex items-center justify-center mr-4">
                  <Building className="h-6 w-6 text-[#ff6433]" />
                </div>

                <div className="flex-grow text-left">
                  <h2 className="text-xl font-semibold">{canteen.name}</h2>
                  <p className="text-gray-500 text-sm line-clamp-1">{canteen.description || 'No description available'}</p>
                </div>

                <ArrowRight className="h-5 w-5 text-gray-400" />
              </button>
            </motion.div>
          ))}
        </div>
      </main>

      <footer className="py-6 text-center text-gray-500 text-sm">
        <p>© 2025 Canteen. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Index;
