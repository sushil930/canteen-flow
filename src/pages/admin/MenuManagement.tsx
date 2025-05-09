import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Plus, Trash, Edit, Loader2, UtensilsCrossed } from 'lucide-react';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { Badge } from '@/components/ui/badge';
import { motion } from "framer-motion";
import { Infinity } from 'ldrs/react';
import 'ldrs/react/Infinity.css';
import {
  Dialog, /* ... other Dialog imports ... */
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from "@/components/ui/alert-dialog" // Import AlertDialog components
import { useToast } from "@/components/ui/use-toast"

interface ApiMenuItem {
  id: number;
  canteen: string;
  category: string | null;
  name: string;
  description: string;
  price: string;
  image: string | null;
  is_available: boolean;
}

interface ApiCategory {
  id: number;
  name: string;
}

interface ApiCanteen {
  id: number;
  name: string;
  description: string;
}

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  description: z.string().min(5, {
    message: "Description must be at least 5 characters.",
  }),
  price: z.number().min(0.01, {
    message: "Price must be greater than 0.",
  }),
  category: z.string().min(1, {
    message: "Please select a category.",
  }),
});

const MenuManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Define the base URL for admin menu items
  const ADMIN_MENU_ITEMS_URL = '/admin/menu-items/';

  const { data: menuItemsData, isLoading: isLoadingMenuItems, error: menuItemsError } = useQuery<ApiMenuItem[]>({
    queryKey: ['adminMenuItems', searchTerm, categoryFilter],
    queryFn: async () => {
      const data = await apiClient<ApiMenuItem[]>(ADMIN_MENU_ITEMS_URL);
      return data.filter(item => {
        const matchesSearch =
          item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.description.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = categoryFilter === 'All' || item.category === categoryFilter;
        return matchesSearch && matchesCategory;
      });
    }
  });

  const { data: categoriesData, isLoading: isLoadingCategories } = useQuery<ApiCategory[]>({
    queryKey: ['categories'],
    queryFn: () => apiClient<ApiCategory[]>('/categories/')
  });

  const { data: canteensData, isLoading: isLoadingCanteens } = useQuery<ApiCanteen[]>({
    queryKey: ['canteens'],
    queryFn: () => apiClient<ApiCanteen[]>('/canteens/')
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      price: 0,
      category: "",
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    console.log("Add item form submitted", values);
  };

  const createMenuItem = useMutation<ApiMenuItem, Error, MenuItemPayload | FormData>({
    mutationFn: (newItemData) => {
      return apiClient<ApiMenuItem>(ADMIN_MENU_ITEMS_URL, {
        method: 'POST',
        body: newItemData,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminMenuItems'] });
      toast({ title: "Success", description: "Menu item added successfully." });
      form.reset();
      setIsFormOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to add menu item: ${error.message}`,
        variant: "destructive"
      });
    },
  });

  const updateMenuItem = useMutation<
    ApiMenuItem,
    Error,
    { id: number; payload: MenuItemPayload | FormData }
  >({
    mutationFn: ({ id, payload }) => {
      return apiClient<ApiMenuItem>(`${ADMIN_MENU_ITEMS_URL}${id}/`, {
        method: 'PUT',
        body: payload,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminMenuItems'] });
      toast({ title: "Success", description: "Menu item updated successfully." });
      setIsFormOpen(false);
      setEditingItem(null);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to update menu item: ${error.message}`,
        variant: "destructive"
      });
    },
  });

  const deleteMenuItem = useMutation<void, Error, number>({
    mutationFn: (id) => {
      return apiClient<void>(`${ADMIN_MENU_ITEMS_URL}${id}/`, {
        method: 'DELETE',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminMenuItems'] });
      toast({ title: "Success", description: "Menu item deleted successfully." });
      setConfirmDelete(null);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to delete menu item: ${error.message}`,
        variant: "destructive"
      });
      setConfirmDelete(null);
    },
  });

  const handleDeleteItem = (id: number) => {
    setConfirmDelete(id);
  };

  const confirmDeleteItemAction = () => {
    if (confirmDelete !== null) {
      deleteMenuItem.mutate(confirmDelete);
    }
  };

  if (isLoadingMenuItems || isLoadingCategories || isLoadingCanteens) {
    return (
      <div className="flex flex-col justify-center items-center h-64">
        <Infinity
          size="55"
          stroke="4"
          strokeLength="0.15"
          bgOpacity="0.1"
          speed="1.3"
          color="var(--canteen-primary)" 
        />
        <p className="text-gray-500 font-medium mt-4">Loading menu data...</p>
      </div>
    );
  }

  if (menuItemsError) {
    return <div className="text-red-600 p-4 bg-red-50 rounded-md">Error loading menu items: {(menuItemsError as Error).message}</div>;
  }

  const menuItems = menuItemsData || [];
  const categories = categoriesData || [];
  const canteens = canteensData || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-heading font-bold mb-2">Menu Management</h1>
        <p className="text-muted-foreground">Add, edit, or remove menu items</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
            <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
              <div className="relative w-full md:w-72">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <Input
                  placeholder="Search menu items..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="flex gap-2 w-full md:w-auto">
                <select
                  className="bg-white border rounded-md px-3 py-2 text-sm"
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                >
                  <option value="All">All Categories</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.name}>{category.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Canteen</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {menuItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell>{item.canteen}</TableCell>
                    <TableCell>{item.category || 'N/A'}</TableCell>
                    <TableCell>${parseFloat(item.price).toFixed(2)}</TableCell>
                    <TableCell>
                      <Badge variant={item.is_available ? 'default' : 'outline'}>
                        {item.is_available ? 'Available' : 'Unavailable'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button variant="ghost" size="sm">
                        <Edit size={16} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteItem(item.id)}
                        className="text-red-600 hover:text-red-700"
                        disabled={deleteMenuItem.isPending && confirmDelete === item.id}
                      >
                        {deleteMenuItem.isPending && confirmDelete === item.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash size={16} />
                        )}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {menuItems.length === 0 && (
              <div className="py-8 text-center text-gray-500">
                No menu items matching your filters
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-heading font-bold mb-4">Add New Menu Item</h2>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Item Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Classic Burger" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Input placeholder="Brief description of the item" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price ($)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="9.99"
                          step="0.01"
                          min="0"
                          onChange={(e) => field.onChange(parseFloat(e.target.value))}
                          value={field.value}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <FormControl>
                        <select
                          className="w-full border rounded-md px-3 py-2 text-sm"
                          {...field}
                        >
                          <option value="">Select a category</option>
                          {categories.map(category => (
                            <option key={category.id} value={category.name}>{category.name}</option>
                          ))}
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" className="w-full gap-2">
                  <Plus size={18} />
                  Add Menu Item
                </Button>
              </form>
            </Form>
          </div>
        </div>
      </div>

      <AlertDialog open={confirmDelete !== null} onOpenChange={(isOpen) => !isOpen && setConfirmDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the menu item.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setConfirmDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteItemAction}
              disabled={deleteMenuItem.isPending}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleteMenuItem.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default MenuManagement;
