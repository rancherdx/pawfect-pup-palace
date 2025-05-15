
import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { toast } from "sonner";
import { FileText, Eye, Edit, Trash, Plus, MoreHorizontal } from "lucide-react";

// Mock blog post data
const mockPosts = [
  {
    id: "post-1",
    title: "Essential Care for Your New Puppy: The First 30 Days",
    slug: "essential-puppy-care-first-30-days",
    excerpt: "Bringing home a new puppy is exciting! Here's everything you need to know to get started on the right paw.",
    category: "care",
    status: "published",
    publishedAt: "2025-01-15",
    image: "https://images.unsplash.com/photo-1543466835-00a7907e9de1?ixlib=rb-4.0.3",
    author: "Dr. Sarah Johnson"
  },
  {
    id: "post-2",
    title: "Puppy Vaccination Schedule: What You Need to Know",
    slug: "puppy-vaccination-schedule",
    excerpt: "Keeping your puppy healthy starts with proper vaccinations. Learn about the recommended schedule and why each vaccine matters.",
    category: "health",
    status: "published",
    publishedAt: "2025-02-03",
    image: "https://images.unsplash.com/photo-1611173622330-1c731c6d970e?ixlib=rb-4.0.3",
    author: "Dr. Michael Chang"
  },
  {
    id: "post-3",
    title: "Crate Training: Creating a Safe Space for Your Puppy",
    slug: "crate-training-safe-space",
    excerpt: "Effective crate training helps your puppy feel secure and makes house training easier. Follow these steps for success.",
    category: "training",
    status: "draft",
    publishedAt: null,
    image: "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?ixlib=rb-4.0.3",
    author: "Alex Rodriguez"
  }
];

// Mock categories
const mockCategories = [
  { id: "care", name: "Puppy Care" },
  { id: "health", name: "Health & Wellness" },
  { id: "training", name: "Training Tips" },
  { id: "nutrition", name: "Nutrition" },
  { id: "lifestyle", name: "Lifestyle" }
];

const BlogManager = () => {
  const [posts, setPosts] = useState(mockPosts);
  const [categories, setCategories] = useState(mockCategories);
  const [activeTab, setActiveTab] = useState("all");
  const [newCategory, setNewCategory] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  
  const filteredPosts = posts.filter(post => {
    // Filter by tab
    const matchesTab = activeTab === "all" || 
                      (activeTab === "published" && post.status === "published") ||
                      (activeTab === "drafts" && post.status === "draft");
    
    // Filter by search term
    const matchesSearch = !searchTerm || 
                        post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        post.excerpt.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesTab && matchesSearch;
  });

  const handleDeletePost = (postId: string) => {
    setPosts(posts.filter(post => post.id !== postId));
    toast.success("Blog post deleted");
  };

  const handleToggleStatus = (postId: string) => {
    setPosts(posts.map(post => {
      if (post.id === postId) {
        const newStatus = post.status === "published" ? "draft" : "published";
        return {
          ...post,
          status: newStatus,
          publishedAt: newStatus === "published" ? new Date().toISOString().split("T")[0] : null
        };
      }
      return post;
    }));
    
    toast.success("Post status updated");
  };

  const handleAddCategory = () => {
    if (!newCategory.trim()) {
      toast.error("Category name cannot be empty");
      return;
    }
    
    const categoryId = newCategory.toLowerCase().replace(/\s+/g, '-');
    
    if (categories.find(cat => cat.id === categoryId)) {
      toast.error("Category already exists");
      return;
    }
    
    const newCat = {
      id: categoryId,
      name: newCategory.trim()
    };
    
    setCategories([...categories, newCat]);
    setNewCategory("");
    toast.success(`Category "${newCat.name}" added`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Blog Management</h1>
          <p className="text-muted-foreground">Create and manage your blog content</p>
        </div>
        <div className="flex gap-2">
          <Input
            placeholder="Search posts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full md:w-64"
          />
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Post
          </Button>
        </div>
      </div>
      
      <div className="flex justify-between items-center">
        <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-auto">
          <TabsList>
            <TabsTrigger value="all">All Posts</TabsTrigger>
            <TabsTrigger value="published">Published</TabsTrigger>
            <TabsTrigger value="drafts">Drafts</TabsTrigger>
          </TabsList>
        </Tabs>
        
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Category
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Category</DialogTitle>
              <DialogDescription>
                Categories help organize your blog posts.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="category-name" className="text-right">
                  Name
                </Label>
                <Input
                  id="category-name"
                  placeholder="Category name"
                  className="col-span-3"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleAddCategory}>Add Category</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      
      <Card>
        <CardContent className="p-0">
          <div className="rounded-md border">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="h-12 px-4 text-left font-medium">Title</th>
                  <th className="h-12 px-4 text-left font-medium">Category</th>
                  <th className="h-12 px-4 text-left font-medium">Author</th>
                  <th className="h-12 px-4 text-center font-medium">Status</th>
                  <th className="h-12 px-4 text-center font-medium">Date</th>
                  <th className="h-12 px-4 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPosts.map((post) => (
                  <tr key={post.id} className="border-b">
                    <td className="p-4 align-middle">
                      <div className="flex items-center space-x-4">
                        <div className="h-10 w-10 rounded overflow-hidden">
                          <img
                            src={post.image}
                            alt={post.title}
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div>
                          <p className="font-medium">{post.title}</p>
                          <p className="text-sm text-muted-foreground line-clamp-1">
                            {post.excerpt}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 align-middle">
                      <Badge variant="outline">
                        {post.category}
                      </Badge>
                    </td>
                    <td className="p-4 align-middle">
                      <span>{post.author}</span>
                    </td>
                    <td className="p-4 align-middle text-center">
                      <Badge variant={post.status === "published" ? "default" : "secondary"}>
                        {post.status === "published" ? "Published" : "Draft"}
                      </Badge>
                    </td>
                    <td className="p-4 align-middle text-center">
                      {post.publishedAt || "-"}
                    </td>
                    <td className="p-4 align-middle text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem 
                            className="flex items-center cursor-pointer" 
                            onClick={() => window.open(`/blog/${post.slug}`, '_blank')}
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            View
                          </DropdownMenuItem>
                          <DropdownMenuItem className="flex items-center cursor-pointer">
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className="flex items-center cursor-pointer"
                            onClick={() => handleToggleStatus(post.id)}
                          >
                            <FileText className="mr-2 h-4 w-4" />
                            {post.status === "published" ? "Unpublish" : "Publish"}
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className="flex items-center cursor-pointer text-red-600 focus:text-red-600"
                            onClick={() => handleDeletePost(post.id)}
                          >
                            <Trash className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
                
                {filteredPosts.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-10 text-center">
                      <FileText className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                      <h3 className="font-medium">No posts found</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {searchTerm 
                          ? "Try adjusting your search terms" 
                          : "Get started by creating your first blog post"}
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
        <CardFooter className="border-t bg-muted/50 p-4">
          <div className="flex justify-between w-full items-center">
            <Select>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Bulk actions" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="publish">Publish selected</SelectItem>
                <SelectItem value="unpublish">Unpublish selected</SelectItem>
                <SelectItem value="delete">Delete selected</SelectItem>
              </SelectContent>
            </Select>
            <div className="text-sm text-muted-foreground">
              Showing {filteredPosts.length} of {posts.length} posts
            </div>
          </div>
        </CardFooter>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Blog Settings</CardTitle>
          <CardDescription>Configure your blog's appearance and functionality</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <Label className="font-medium">Comments</Label>
                  <p className="text-sm text-muted-foreground">Allow visitors to comment on posts</p>
                </div>
                <Switch />
              </div>
              
              <div className="flex justify-between items-center">
                <div>
                  <Label className="font-medium">Social Sharing</Label>
                  <p className="text-sm text-muted-foreground">Add social sharing buttons to posts</p>
                </div>
                <Switch defaultChecked />
              </div>
              
              <div className="flex justify-between items-center">
                <div>
                  <Label className="font-medium">Related Posts</Label>
                  <p className="text-sm text-muted-foreground">Show related posts at the end of each article</p>
                </div>
                <Switch defaultChecked />
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="posts-per-page">Posts Per Page</Label>
                <Input id="posts-per-page" type="number" defaultValue="10" className="mt-1" />
              </div>
              
              <div>
                <Label htmlFor="excerpt-length">Excerpt Length</Label>
                <Input id="excerpt-length" type="number" defaultValue="160" className="mt-1" />
                <p className="text-xs text-muted-foreground mt-1">
                  Maximum number of characters for post excerpts
                </p>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="border-t p-4">
          <Button>Save Settings</Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default BlogManager;
