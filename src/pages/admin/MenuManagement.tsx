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
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Plus, Trash, Edit, Loader2, UtensilsCrossed, ImagePlus, X } from 'lucide-react';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
  DialogClose
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from "@/components/ui/alert-dialog";
import { useToast } from "@/components/ui/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ApiMenuItem {
  id: number;
  canteen: number;
  canteen_name?: string;
  category: number | null;
  category_name?: string;
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
}

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

const formSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  description: z.string().min(5, { message: "Description must be at least 5 characters." }).max(200, "Description too long"),
  price: z.coerce.number().min(0.01, { message: "Price must be positive." }),
  category: z.coerce.number().positive({ message: "Please select a category." }).optional().nullable(),
  canteen: z.coerce.number().positive({ message: "Please select a canteen." }),
  is_available: z.boolean().default(true),
  image: z.any()
    .refine((file) => !file || file?.size <= MAX_FILE_SIZE, `Max image size is 5MB.`)
    .refine(
      (file) => !file || ACCEPTED_IMAGE_TYPES.includes(file?.type),
      "Only .jpg, .jpeg, .png and .webp formats are supported."
    ).optional().nullable(),
});

type MenuItemFormData = z.infer<typeof formSchema>;

interface MenuItemPayload {
  name: string;
  description: string;
  price: number;
  category?: number | null;
  canteen: number;
  is_available: boolean;
}

const MenuManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [canteenFilter, setCanteenFilter] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ApiMenuItem | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const form = useForm<MenuItemFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      price: 0,
      category: null,
      canteen: undefined,
      is_available: true,
      image: null,
    },
  });

  const ADMIN_MENU_ITEMS_URL = '/admin/menu-items/';

  const { data: menuItems, isLoading: isLoadingMenuItems, error: menuItemsError } = useQuery<ApiMenuItem[]>({
    queryKey: ['adminMenuItems', categoryFilter, canteenFilter, searchTerm],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (categoryFilter) params.append('category', categoryFilter);
      if (canteenFilter) params.append('canteen', canteenFilter);
      if (searchTerm) params.append('search', searchTerm);
      
      const url = `${ADMIN_MENU_ITEMS_URL}?${params.toString()}`;
      const data = await apiClient<ApiMenuItem[]>(url);
      return data;
    },
    placeholderData: (prev) => prev,
  });

  const { data: categories, isLoading: isLoadingCategories } = useQuery<ApiCategory[]>({ 
    queryKey: ['categories'], 
    queryFn: () => apiClient<ApiCategory[]>('/categories/')
  });

  const { data: canteens, isLoading: isLoadingCanteens } = useQuery<ApiCanteen[]>({ 
    queryKey: ['canteens'], 
    queryFn: () => apiClient<ApiCanteen[]>('/canteens/')
  });

  const mutationOptions = {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminMenuItems'] });
      setIsFormOpen(false);
      setEditingItem(null);
      form.reset();
      setImagePreview(null);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: `Operation failed: ${error.message || 'Unknown error'}`,
        variant: "destructive"
      });
    },
  };

  const createMenuItem = useMutation<ApiMenuItem, Error, FormData>({
    mutationFn: (formData) => apiClient<ApiMenuItem>(ADMIN_MENU_ITEMS_URL, { method: 'POST', body: formData }),
    ...mutationOptions,
    onSuccess: (data) => {
      mutationOptions.onSuccess();
      toast({ title: "Success", description: `Item "${data.name}" added successfully.` });
    }
  });

  const updateMenuItem = useMutation<ApiMenuItem, Error, { id: number; payload: FormData }>({
    mutationFn: ({ id, payload }) => apiClient<ApiMenuItem>(`${ADMIN_MENU_ITEMS_URL}${id}/`, { method: 'PUT', body: payload }),
    ...mutationOptions,
    onSuccess: (data) => {
      mutationOptions.onSuccess();
      toast({ title: "Success", description: `Item "${data.name}" updated successfully.` });
    }
  });

  const deleteMenuItem = useMutation<void, Error, number>({
    mutationFn: (id) => apiClient<void>(`${ADMIN_MENU_ITEMS_URL}${id}/`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminMenuItems'] });
      toast({ title: "Success", description: "Menu item deleted." });
      setConfirmDelete(null);
    },
    onError: (error) => {
      toast({ title: "Error", description: `Deletion failed: ${error.message}`, variant: "destructive" });
      setConfirmDelete(null);
    },
  });

  const handleOpenForm = (item: ApiMenuItem | null = null) => {
    setEditingItem(item);
    if (item) {
      form.reset({
        name: item.name,
        description: item.description,
        price: parseFloat(item.price),
        category: item.category,
        canteen: item.canteen,
        is_available: item.is_available,
        image: null,
      });
      setImagePreview(item.image);
    } else {
      form.reset();
      setImagePreview(null);
    }
    setIsFormOpen(true);
  };

  const onSubmit = (values: MenuItemFormData) => {
    const formData = new FormData();
    formData.append('name', values.name);
    formData.append('description', values.description);
    formData.append('price', values.price.toString());
    formData.append('canteen', values.canteen.toString());
    formData.append('is_available', values.is_available.toString());
    if (values.category) {
      formData.append('category', values.category.toString());
    }
    if (values.image instanceof File) {
      formData.append('image', values.image);
    }

    if (editingItem) {
      updateMenuItem.mutate({ id: editingItem.id, payload: formData });
    } else {
      createMenuItem.mutate(formData);
    }
  };

  const handleDeleteItem = (id: number) => {
    setConfirmDelete(id);
  };

  const confirmDeleteItemAction = () => {
    if (confirmDelete !== null) {
      deleteMenuItem.mutate(confirmDelete);
    }
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      form.setValue('image', file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      form.setValue('image', null);
      setImagePreview(null);
    }
  };

  const isLoading = isLoadingMenuItems || isLoadingCategories || isLoadingCanteens;
  const mutationLoading = createMenuItem.isPending || updateMenuItem.isPending;

  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center h-64">
        <Infinity size="55" stroke="4" strokeLength="0.15" bgOpacity="0.1" speed="1.3" color="hsl(var(--primary))" />
        <p className="text-muted-foreground font-medium mt-4">Loading menu data...</p>
      </div>
    );
  }

  if (menuItemsError) {
    return <div className="text-destructive p-4 bg-destructive/10 rounded-md">Error loading menu items: {(menuItemsError as Error).message}</div>;
  }

  const filteredMenuItems = menuItems || [];

  return (
    <div className="space-y-6 p-1">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-heading font-bold">Menu Management</h1>
          <p className="text-muted-foreground">Manage items available in canteens.</p>
        </div>
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => handleOpenForm()} className="gap-1 bg-canteen-primary hover:bg-canteen-primary/90">
              <Plus size={18} />
              Add Menu Item
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[550px]">
            <DialogHeader>
              <DialogTitle>{editingItem ? 'Edit' : 'Add'} Menu Item</DialogTitle>
              <DialogDescription>
                {editingItem ? 'Update the details of the menu item.' : 'Fill in the details to add a new item to the menu.'}
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Item Name *</FormLabel>
                      <FormControl><Input placeholder="e.g. Classic Burger" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description *</FormLabel>
                      <FormControl><Textarea placeholder="Brief description (max 200 chars)" {...field} rows={3} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Price ($) *</FormLabel>
                        <FormControl>
                            <Input type="number" placeholder="9.99" step="0.01" min="0" {...field} />
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
                           <Select 
                              onValueChange={(value) => field.onChange(value ? Number(value) : null)} 
                              value={field.value?.toString() ?? ""}
                           >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a category" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="">-- No Category --</SelectItem>
                              {(categories ?? []).map(category => (
                                <SelectItem key={category.id} value={category.id.toString()}>{category.name}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                </div>
                <FormField
                  control={form.control}
                  name="canteen"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Canteen *</FormLabel>
                       <Select 
                          onValueChange={(value) => field.onChange(Number(value))} 
                          value={field.value?.toString() ?? ""}
                          disabled={!canteens || canteens.length === 0}
                       >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select the canteen" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {(canteens ?? []).map(canteen => (
                            <SelectItem key={canteen.id} value={canteen.id.toString()}>{canteen.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="is_available"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm bg-gray-50 dark:bg-gray-800/50">
                      <div className="space-y-0.5">
                        <FormLabel>Availability</FormLabel>
                        <FormDescription>
                          Is this item currently available for ordering?
                        </FormDescription>
                      </div>
                      <FormControl>
                         <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="image"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Image</FormLabel>
                      <FormControl>
                        <div className="flex items-center gap-4">
                           <label className="cursor-pointer flex-1 flex items-center justify-center gap-2 px-3 py-2 border-2 border-dashed rounded-md hover:border-primary">
                             <ImagePlus size={18} className="text-muted-foreground" />
                             <span className="text-sm text-muted-foreground">{imagePreview ? 'Change Image' : 'Upload Image'}</span>
                            <Input type="file" accept="image/*" className="sr-only" onChange={handleImageChange} />
                           </label>
                           {imagePreview && (
                            <div className="relative group">
                                <img src={imagePreview} alt="Preview" className="h-16 w-16 object-cover rounded-md border" />
                                <Button 
                                    variant="destructive" 
                                    size="icon" 
                                    className="absolute -top-2 -right-2 h-6 w-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                    onClick={() => { form.setValue('image', null); setImagePreview(null); }}
                                >
                                    <X size={14} />
                                </Button>
                             </div>
                           )}
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <DialogClose asChild>
                    <Button type="button" variant="outline">Cancel</Button>
                  </DialogClose>
                  <Button type="submit" disabled={mutationLoading} className="bg-canteen-primary hover:bg-canteen-primary/90">
                    {mutationLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {editingItem ? 'Save Changes' : 'Add Item'}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="rounded-xl shadow-md border border-border/50">
         <CardHeader className="border-b p-4">
            <CardTitle className="text-lg">Menu Items</CardTitle>
             <div className="flex flex-col md:flex-row gap-3 mt-3">
              <div className="relative w-full md:w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={16} />
                <Input
                  placeholder="Search by name/description..."
                  className="pl-9 h-9"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Select onValueChange={(value) => setCategoryFilter(value === 'all' ? null : value)} value={categoryFilter ?? 'all'}>
                <SelectTrigger className="w-full md:w-[180px] h-9">
                    <SelectValue placeholder="Filter by Category" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {(categories ?? []).map(cat => (
                    <SelectItem key={cat.id} value={cat.id.toString()}>{cat.name}</SelectItem>
                    ))}
                </SelectContent>
                </Select>
              <Select onValueChange={(value) => setCanteenFilter(value === 'all' ? null : value)} value={canteenFilter ?? 'all'}>
                <SelectTrigger className="w-full md:w-[180px] h-9">
                    <SelectValue placeholder="Filter by Canteen" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All Canteens</SelectItem>
                    {(canteens ?? []).map(can => (
                    <SelectItem key={can.id} value={can.id.toString()}>{can.name}</SelectItem>
                    ))}
                </SelectContent>
             </Select>
            </div>
          </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[70px]"></TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Canteen</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMenuItems.length > 0 ? (
                  filteredMenuItems.map((item) => (
                    <TableRow key={item.id} className="hover:bg-muted/50">
                      <TableCell className="p-2">
                        <img 
                          src={item.image || 'https://via.placeholder.com/150/EFEFD0/AAAAAA?text=No+Image'} 
                          alt={item.name}
                          className="h-12 w-12 object-cover rounded-md border"
                        />
                      </TableCell>
                      <TableCell className="font-medium py-2 px-4">{item.name}</TableCell>
                      <TableCell className="py-2 px-4 text-muted-foreground">{item.canteen_name || item.canteen}</TableCell>
                      <TableCell className="py-2 px-4 text-muted-foreground">{item.category_name || 'N/A'}</TableCell>
                      <TableCell className="py-2 px-4">${parseFloat(item.price).toFixed(2)}</TableCell>
                      <TableCell className="py-2 px-4">
                         <Badge 
                           variant={item.is_available ? 'success' : 'outline'} 
                           className={`text-xs ${item.is_available ? 'border-green-600/30 bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'border-amber-600/30 bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'}`}
                         >
                          {item.is_available ? 'Available' : 'Unavailable'}
                         </Badge>
                      </TableCell>
                      <TableCell className="text-right space-x-1 py-2 px-4">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleOpenForm(item)}>
                          <Edit size={16} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => handleDeleteItem(item.id)}
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
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                      No menu items found matching your criteria.
                      {(searchTerm || categoryFilter || canteenFilter) && (
                         <Button variant="link" className="ml-2 text-sm" onClick={() => {setSearchTerm(''); setCategoryFilter(null); setCanteenFilter(null);}}>Clear filters</Button>
                      )}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={confirmDelete !== null} onOpenChange={(isOpen) => !isOpen && setConfirmDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the menu item.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setConfirmDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteItemAction}
              disabled={deleteMenuItem.isPending}
              className="bg-destructive hover:bg-destructive/90"
            >
              {deleteMenuItem.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete Item
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default MenuManagement;
