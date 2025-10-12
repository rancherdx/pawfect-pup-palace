import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Plus, Edit, Trash, Search, Loader2, FileText, CheckCircle, XCircle } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '@/api';
import { toast } from 'sonner';
import { BlogPost, BlogPostStatus } from "@/types/api";
import { BlogPostCreationData, BlogPostUpdateData } from '@/api/adminApi';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { format } from 'date-fns';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"

const initialFormData: BlogPostCreationData = {
  title: "",
  slug: "",
  content: "",
  category: "",
  status: "draft",
  featured_image_url: "",
  excerpt: "",
};

const BLOG_POST_STATUS_VALUES: BlogPostStatus[] = ["draft", "published", "archived"];

/**
 * @component BlogManager
 * @description A comprehensive component for managing blog posts.
 * @returns {React.ReactElement} The rendered blog management interface.
 */
const BlogManager = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [currentPost, setCurrentPost] = useState<BlogPost | null>(null);
  const [formData, setFormData] = useState<BlogPostCreationData | BlogPostUpdateData>(initialFormData);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [postToDeleteId, setPostToDeleteId] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | BlogPostStatus>("all");

  const queryClient = useQueryClient();

  const { data, isLoading, isError, error } = useQuery<{ posts: BlogPost[] }, Error>({
    queryKey: ['blogPosts', { filter }],
    queryFn: () => adminApi.getAllPosts({ status: filter === "all" ? undefined : filter }),
    staleTime: 5 * 60 * 1000,
  });

  const posts = data?.posts || [];

  const addPostMutation = useMutation({
    mutationFn: (newData: BlogPostCreationData) => adminApi.createPost(newData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blogPosts'] });
      toast.success('Blog post added successfully!');
      setShowForm(false);
      setFormData(initialFormData);
    },
    onError: (err: Error) => {
      toast.error(`Failed to add blog post: ${err.message}`);
    }
  });

  const updatePostMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: BlogPostUpdateData }) => adminApi.updatePost(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blogPosts'] });
      toast.success('Blog post updated successfully!');
      setShowForm(false);
      setCurrentPost(null);
      setFormData(initialFormData);
    },
    onError: (err: Error) => {
      toast.error(`Failed to update blog post: ${err.message}`);
    }
  });

  const deletePostMutation = useMutation({
    mutationFn: (id: string) => adminApi.deletePost(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blogPosts'] });
      toast.success('Blog post deleted successfully!');
      setPostToDeleteId(null);
      setShowDeleteDialog(false);
    },
    onError: (err: Error) => {
      toast.error(`Failed to delete blog post: ${err.message}`);
      setPostToDeleteId(null);
      setShowDeleteDialog(false);
    }
  });

  useEffect(() => {
    if (currentPost && showForm) {
      setFormData({
        title: currentPost.title,
        slug: currentPost.slug,
        content: currentPost.content,
        category: currentPost.category || "",
        status: currentPost.status,
        featured_image_url: currentPost.featured_image_url || "",
        excerpt: currentPost.excerpt || "",
      });
    } else {
      setFormData(initialFormData);
    }
  }, [currentPost, showForm]);

  const handleDeletePost = (id: string) => {
    setPostToDeleteId(id);
    setShowDeleteDialog(true);
  };

  const confirmDeletePost = () => {
    if (postToDeleteId) {
      deletePostMutation.mutate(postToDeleteId);
    }
  };

  const handleEditPost = (post: BlogPost) => {
    setCurrentPost(post);
    setShowForm(true);
  };

  const handleAddPost = () => {
    setCurrentPost(null);
    setFormData(initialFormData);
    setShowForm(true);
  };

  const handleSavePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentPost && currentPost.id) {
      updatePostMutation.mutate({ id: currentPost.id, data: formData as BlogPostUpdateData });
    } else {
      addPostMutation.mutate(formData as BlogPostCreationData);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const filteredPosts = posts.filter(post =>
    post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (post.category && post.category.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const isMutationLoading = addPostMutation.isPending || updatePostMutation.isPending;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h2 className="text-3xl font-bold flex items-center">
          <FileText className="mr-2 h-8 w-8 text-brand-red" />
          Blog Post Management
        </h2>
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              type="text"
              placeholder="Search blog posts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 border rounded-lg w-full md:w-64 focus:outline-none focus:ring-2 focus:ring-brand-red"
            />
          </div>
          <Button
            onClick={handleAddPost}
            className="bg-brand-red hover:bg-red-700 text-white flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add New Post
          </Button>
        </div>
      </div>

      <BlogFilter value={filter} onChange={(value) => setFilter(value)} />

      {showForm ? (
        <Card className="shadow-lg border-t-4 border-t-brand-red animate-fade-in">
          <CardHeader className="bg-gray-50 dark:bg-gray-900/20">
            <CardTitle className="text-2xl">
              {currentPost ? "Edit Blog Post" : "Add New Blog Post"}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <ScrollArea className="h-[600px] w-full rounded-md border p-4">
              <form onSubmit={handleSavePost} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="title" className="font-medium">Title</Label>
                  <Input id="title" name="title" value={formData.title} onChange={handleInputChange} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="slug" className="font-medium">Slug</Label>
                  <Input id="slug" name="slug" value={formData.slug} onChange={handleInputChange} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category" className="font-medium">Category</Label>
                  <Input id="category" name="category" value={formData.category || ''} onChange={handleInputChange} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="excerpt" className="font-medium">Excerpt</Label>
                  <Textarea id="excerpt" name="excerpt" value={formData.excerpt || ''} onChange={handleInputChange} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="featured_image_url" className="font-medium">Featured Image URL</Label>
                  <Input id="featured_image_url" name="featured_image_url" value={formData.featured_image_url || ''} onChange={handleInputChange} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status" className="font-medium">Status</Label>
                  <select id="status" name="status" value={formData.status} onChange={handleInputChange} className="w-full p-2 border rounded-md">
                    {BLOG_POST_STATUS_VALUES.map(status => <option key={status} value={status}>{status}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="content" className="font-medium">Content</Label>
                  <Textarea id="content" name="content" value={formData.content} onChange={handleInputChange} rows={15} />
                </div>
                <div className="flex justify-end gap-3 pt-4">
                  <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
                  <Button type="submit" className="bg-brand-red hover:bg-red-700 text-white min-w-32" disabled={isMutationLoading}>
                    {isMutationLoading ? <Loader2 className="animate-spin" /> : (currentPost ? "Update Post" : "Create Post")}
                  </Button>
                </div>
              </form>
            </ScrollArea>
          </CardContent>
        </Card>
      ) : (
        <div className="w-full overflow-x-auto">
          <Table>
            <TableCaption>A list of your recent blog posts.</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Author</TableHead>
                <TableHead>Published At</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (<TableRow><TableCell colSpan={6} className="text-center py-4"><Loader2 className="mx-auto animate-spin" /></TableCell></TableRow>)
              : isError ? (<TableRow><TableCell colSpan={6} className="text-center py-4 text-red-500">Error: {error.message}</TableCell></TableRow>)
              : filteredPosts.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="text-center py-4">No blog posts found.</TableCell></TableRow>
              ) : (
                filteredPosts.map((post) => (
                  <TableRow key={post.id}>
                    <TableCell className="font-medium">{post.title}</TableCell>
                    <TableCell>{post.category}</TableCell>
                    <TableCell>{post.author_name || 'Anonymous'}</TableCell>
                    <TableCell>{post.published_at ? format(new Date(post.published_at), 'MMM dd, yyyy') : 'Not published'}</TableCell>
                    <TableCell>
                      {post.status === 'draft' && <div className="flex items-center gap-1 text-gray-500"><FileText className="w-4 h-4" /> Draft</div>}
                      {post.status === 'published' && <div className="flex items-center gap-1 text-green-600"><CheckCircle className="w-4 h-4" /> Published</div>}
                      {post.status === 'archived' && <div className="flex items-center gap-1 text-red-600"><XCircle className="w-4 h-4" /> Archived</div>}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleEditPost(post)}><Edit className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-700" onClick={() => handleDeletePost(post.id)}><Trash className="h-4 w-4" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}

      {postToDeleteId && (
        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>This will permanently delete the blog post.</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setShowDeleteDialog(false)}>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={confirmDeletePost} disabled={deletePostMutation.isPending}>
                {deletePostMutation.isPending ? <Loader2 className="animate-spin" /> : "Delete"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
};

interface BlogFilterProps {
  value: "all" | BlogPostStatus;
  onChange: (value: "all" | BlogPostStatus) => void;
}

const BlogFilter: React.FC<BlogFilterProps> = ({ value, onChange }) => (
  <div className="flex items-center space-x-2">
    <Label htmlFor="status-filter">Filter by Status:</Label>
    <select
      id="status-filter"
      value={value}
      onChange={(e) => onChange(e.target.value as "all" | BlogPostStatus)}
      className="border rounded-md px-3 py-1.5 text-sm"
    >
      <option value="all">All</option>
      {BLOG_POST_STATUS_VALUES.map(status => <option key={status} value={status}>{status.charAt(0).toUpperCase() + status.slice(1)}</option>)}
    </select>
  </div>
);

export default BlogManager;