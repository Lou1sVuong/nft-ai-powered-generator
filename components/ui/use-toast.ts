// Basic toast notification utility
export interface ToastProps {
  title: string;
  description: string;
  variant?: 'default' | 'destructive' | 'success';
}

// Simple implementation that uses browser's built-in alert
// In a real app, you would use a more sophisticated toast library
export const toast = (props: ToastProps) => {
  const { title, description, variant = 'default' } = props;
  
  // Log to console in development
  console.log(`[${variant.toUpperCase()}] ${title}: ${description}`);
  
  // For demo purposes, we'll use a simple alert
  // In production, replace this with a proper toast notification component
  alert(`${title}\n${description}`);
  
  return { id: Date.now().toString() };
}; 