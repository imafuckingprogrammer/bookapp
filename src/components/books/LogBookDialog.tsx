
"use client";

import { useState, useEffect, type Dispatch, type SetStateAction } from 'react';
import type { Book, Review } from '@/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { StarRating } from '@/components/ui/StarRating';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Save } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface LogBookDialogProps {
  book: Book;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onLogSaved: (logDetails: {
    rating?: number;
    isRead?: boolean;
    readDate?: string;
    reviewText?: string;
  }) => void;
  existingReview?: Review | null; // Pass existing review to edit
}

export function LogBookDialog({ book, isOpen, onOpenChange, onLogSaved, existingReview }: LogBookDialogProps) {
  const { toast } = useToast();
  const [rating, setRating] = useState<number | undefined>(existingReview?.rating ?? book.userRating);
  const [isRead, setIsRead] = useState<boolean>(existingReview ? true : book.isRead || false);
  const [readDate, setReadDate] = useState<Date | undefined>(
    existingReview?.createdAt ? new Date(existingReview.createdAt) : (book.readDate ? new Date(book.readDate) : undefined)
  );
  const [reviewText, setReviewText] = useState<string>(existingReview?.reviewText || '');
  
  useEffect(() => {
    // Reset form when dialog opens or book changes, or existing review changes
    setRating(existingReview?.rating ?? book.userRating);
    setIsRead(existingReview ? true : book.isRead || false);
    setReadDate(existingReview?.createdAt ? new Date(existingReview.createdAt) : (book.readDate ? new Date(book.readDate) : undefined));
    setReviewText(existingReview?.reviewText || '');
  }, [isOpen, book, existingReview]);

  const handleSave = () => {
    if (isRead && !readDate) {
      toast({ title: "Date Required", description: "Please select a date for when you read the book.", variant: "destructive" });
      return;
    }
    if (isRead && !rating) {
        toast({ title: "Rating Required", description: "Please provide a rating if you've read the book.", variant: "destructive" });
        return;
    }

    onLogSaved({
      rating: rating,
      isRead: isRead,
      readDate: isRead && readDate ? readDate.toISOString() : undefined,
      reviewText: reviewText,
    });
    toast({ title: "Log Updated!", description: `Your activity for "${book.title}" has been saved.` });
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Log & Review: {book.title}</DialogTitle>
          <DialogDescription>
            Rate this book, mark it as read, and optionally write a review.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-6 py-4">
          <div className="space-y-2">
            <Label htmlFor="rating">Your Rating</Label>
            <StarRating 
              count={5} 
              initialRating={rating} 
              onRatingChange={setRating} 
              size={28} 
            />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox 
              id="isRead" 
              checked={isRead} 
              onCheckedChange={(checked) => setIsRead(Boolean(checked))}
            />
            <Label htmlFor="isRead" className="font-medium">I have read this book</Label>
          </div>

          {isRead && (
            <div className="space-y-2">
              <Label htmlFor="readDate">Date Read</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !readDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {readDate ? format(readDate, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={readDate}
                    onSelect={setReadDate}
                    initialFocus
                    disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                  />
                </PopoverContent>
              </Popover>
            </div>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="reviewText">Your Review / Notes</Label>
            <Textarea 
              id="reviewText"
              placeholder={isRead ? `What did you think of "${book.title}"?` : "Add some notes..."}
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              className="min-h-[120px]"
            />
             <p className="text-xs text-muted-foreground">
                {isRead ? "This will be published as your review." : "Notes are private to your log."}
            </p>
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline">Cancel</Button>
          </DialogClose>
          <Button type="button" onClick={handleSave} className="transition-transform hover:scale-105">
            <Save className="mr-2 h-4 w-4" /> Save Log
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
