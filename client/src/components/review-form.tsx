import { useState } from 'react';
import { StarRating } from '@/components/ui/star-rating';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { insertReviewSchema } from '@shared/schema';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

interface ReviewFormProps {
  productId: number;
}

export function ReviewForm({ productId }: ReviewFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const validationSchema = insertReviewSchema.extend({
    email: z.string().email('Please enter a valid email address'),
    rating: z.number().min(1, 'Please select a rating').max(5),
    userName: z.string().min(2, 'Please enter your name'),
    title: z.string().min(3, 'Please enter a review title'),
    content: z.string().min(10, 'Please enter a review with at least 10 characters'),
  });

  type ReviewFormValues = z.infer<typeof validationSchema>;

  const form = useForm<ReviewFormValues>({
    resolver: zodResolver(validationSchema),
    defaultValues: {
      productId,
      userName: '',
      email: '',
      title: '',
      content: '',
      rating: 0,
      isVerifiedPurchase: false,
    },
  });

  const mutation = useMutation({
    mutationFn: (values: ReviewFormValues) =>
      apiRequest('POST', '/api/reviews', values),
    onSuccess: () => {
      form.reset();
      toast({
        title: 'Review submitted',
        description: 'Thank you for sharing your experience!',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/reviews', productId] });
      queryClient.invalidateQueries({ queryKey: ['/api/products', productId] });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: `Failed to submit review: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  const onSubmit = (values: ReviewFormValues) => {
    mutation.mutate(values);
  };

  return (
    <div className="max-w-2xl mx-auto bg-neutral p-6 rounded-lg shadow-sm">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="rating"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="block text-gray-700 font-medium mb-2">
                  Rate your experience
                </FormLabel>
                <FormControl>
                  <StarRating
                    rating={field.value}
                    interactive={true}
                    size="lg"
                    onRatingChange={field.onChange}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel htmlFor="review-title">Title</FormLabel>
                <FormControl>
                  <Input
                    id="review-title"
                    placeholder="Summarize your experience"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="content"
            render={({ field }) => (
              <FormItem>
                <FormLabel htmlFor="review-content">Review</FormLabel>
                <FormControl>
                  <Textarea
                    id="review-content"
                    placeholder="Share your thoughts on the product and your experience"
                    rows={4}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="userName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="review-name">Your Name</FormLabel>
                  <FormControl>
                    <Input id="review-name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="review-email">Email</FormLabel>
                  <FormControl>
                    <Input id="review-email" type="email" {...field} />
                  </FormControl>
                  <p className="text-xs text-gray-500 mt-1">* Email will not be published</p>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="isVerifiedPurchase"
            render={({ field }) => (
              <FormItem className="flex items-center space-x-2">
                <FormControl>
                  <Checkbox
                    id="verified-purchase"
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <Label htmlFor="verified-purchase">
                    I am a verified purchaser of this product
                  </Label>
                </div>
              </FormItem>
            )}
          />

          <Button
            type="submit"
            className="bg-primary hover:bg-primary-dark text-white font-medium py-2 px-4 rounded-md transition-all"
            disabled={mutation.isPending}
          >
            {mutation.isPending ? 'Submitting...' : 'Submit Review'}
          </Button>
        </form>
      </Form>
    </div>
  );
}
