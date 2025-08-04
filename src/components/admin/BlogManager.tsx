import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Plus, Edit, Trash, Search, Loader2, FileText, CheckCircle, XCircle } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '@/api';
import { toast } from 'sonner';
import { BlogPost, BlogPostStatus, BlogPostCreateData, BlogPostUpdateData } from "@/types";
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

const initialFormData: BlogPostCreateData = {
  title: "",
  slug: "",
  content: "",
  category: "",
  status: "draft",
  featuredImageUrl: "",
  excerpt: "",
};

const BLOG_POST_STATUS_VALUES: BlogPostStatus[] = ["draft", "published", "archived"];

const BlogManager = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [currentPost, setCurrentPost] = useState<BlogPost | null>(null);
  const [formData, setFormData] = useState<BlogPostCreateData>(initialFormData);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [postToDeleteId, setPostToDeleteId] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | BlogPostStatus>("all");

  const queryClient = useQueryClient();

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['blogPosts', { filter }],
    queryFn: () => adminApi.getAllPosts({ status: filter === "all" ? undefined : filter }),
    staleTime: 5 * 60 * 1000,
  });

  const posts: BlogPost[] = (data as any)?.posts || [];

  const addPostMutation = useMutation({
    mutationFn: (newData: BlogPostCreateData) => adminApi.createPost(newData),
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
        featuredImageUrl: currentPost.featuredImageUrl || "",
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
    const payload: BlogPostCreateData | BlogPostUpdateData = {
      ...formData,
    };

    if (currentPost && currentPost.id) {
      updatePostMutation.mutate({ id: currentPost.id, data: payload as BlogPostUpdateData });
    } else {
      addPostMutation.mutate(payload as BlogPostCreateData);
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

  const filteredPosts: BlogPost[] = posts.filter(post =>
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
            <input
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
            <ScrollArea className="h-[600px] w-full rounded-md border">
              <form onSubmit={handleSavePost} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label className="block text-lg font-medium mb-1">
                        Title
                      </Label>
                      <Input
                        required
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleInputChange}
                        placeholder="Enter blog post title"
                        className="w-full p-3 border rounded-lg text-lg focus:outline-none focus:ring-2 focus:ring-brand-red"
                      />
                    </div>
                    <div>
                      <Label className="block text-lg font-medium mb-1">
                        Slug
                      </Label>
                      <Input
                        required
                        type="text"
                        name="slug"
                        value={formData.slug}
                        onChange={handleInputChange}
                        placeholder="Enter slug"
                        className="w-full p-3 border rounded-lg text-lg focus:outline-none focus:ring-2 focus:ring-brand-red"
                      />
                    </div>
                    <div>
                      <Label className="block text-lg font-medium mb-1">
                        Category
                      </Label>
                      <Input
                        type="text"
                        name="category"
                        value={formData.category}
                        onChange={handleInputChange}
                        placeholder="Enter category"
                        className="w-full p-3 border rounded-lg text-lg focus:outline-none focus:ring-2 focus:ring-brand-red"
                      />
                    </div>
                    <div>
                      <Label className="block text-lg font-medium mb-1">
                        Excerpt
                      </Label>
                      <Textarea
                        name="excerpt"
                        value={formData.excerpt}
                        onChange={handleInputChange}
                        placeholder="Enter excerpt"
                        className="w-full p-3 border rounded-lg text-lg focus:outline-none focus:ring-2 focus:ring-brand-red"
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <Label className="block text-lg font-medium mb-1">
                        Featured Image URL
                      </Label>
                      <Input
                        type="text"
                        name="featuredImageUrl"
                        value={formData.featuredImageUrl}
                        onChange={handleInputChange}
                        placeholder="Enter featured image URL"
                        className="w-full p-3 border rounded-lg text-lg focus:outline-none focus:ring-2 focus:ring-brand-red"
                      />
                    </div>

                    <div>
                      <Label className="block text-lg font-medium mb-1">
                        Status
                      </Label>
                      <select
                        name="status"
                        value={formData.status}
                        onChange={handleInputChange}
                        className="w-full p-3 border rounded-lg text-lg focus:outline-none focus:ring-2 focus:ring-brand-red"
                      >
                        {BLOG_POST_STATUS_VALUES.map(statusValue => (
                          <option key={statusValue} value={statusValue}>{statusValue}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <Label className="block text-lg font-medium mb-1">
                    Content
                  </Label>
                  <Textarea
                    name="content"
                    value={formData.content}
                    onChange={handleInputChange}
                    placeholder="Enter blog post content"
                    rows={10}
                    className="w-full p-3 border rounded-lg text-lg focus:outline-none focus:ring-2 focus:ring-brand-red resize-none"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowForm(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="bg-brand-red hover:bg-red-700 text-white min-w-32"
                  >
                    {currentPost ? "Update Post" : "Create Post"}
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
                <TableHead className="w-[200px]">Title</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Author</TableHead>
                <TableHead>Published At</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPosts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-4">No blog posts found.</TableCell>
                </TableRow>
              ) : (
                filteredPosts.map((post) => (
                  <TableRow key={post.id}>
                    <TableCell className="font-medium">{post.title}</TableCell>
                    <TableCell>{post.category}</TableCell>
                    <TableCell>
                      {typeof post.author === 'string' ? post.author : post.author?.name || 'Anonymous'}
                    </TableCell>
                    <TableCell>{post.publishedAt ? format(new Date(post.publishedAt), 'MMM dd, yyyy') : 'Not published'}</TableCell>
                    <TableCell>
                      {post.status === 'draft' && (
                        <div className="flex items-center gap-1"><FileText className="w-4 h-4 text-gray-500" /> Draft</div>
                      )}
                      {post.status === 'published' && (
                        <div className="flex items-center gap-1"><CheckCircle className="w-4 h-4 text-green-500" /> Published</div>
                      )}
                      {post.status === 'archived' && (
                        <div className="flex items-center gap-1"><XCircle className="w-4 h-4 text-red-500" /> Archived</div>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditPost(post)}
                          className="h-8 w-8 p-0"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeletePost(post.id)}
                          className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
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
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the blog post
                and remove its data from our servers.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => { setShowDeleteDialog(false); setPostToDeleteId(null); }}>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={confirmDeletePost} disabled={deletePostMutation.isPending}>
                {deletePostMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Yes, delete post
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

const BlogFilter: React.FC<BlogFilterProps> = ({ value, onChange }) => {
  return (
    <div className="flex items-center space-x-4">
      <Label>Filter by Status:</Label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as "all" | BlogPostStatus)}
        className="border rounded-md px-4 py-2"
      >
        <option value="all">All</option>
        <option value="draft">Draft</option>
        <option value="published">Published</option>
        <option value="archived">Archived</option>
      </select>
    </div>
  );
};

export default BlogManager;
