"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { wordSchema, normalizeWord, type WordFormValues } from "@/lib/validation";
import { categoryLabel } from "@/lib/utils";
import type { Word } from "@/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const EMOJI_SUGGESTIONS = ["🍎", "🐱", "🔴", "📖", "👩", "1️⃣", "⭐", "🌳", "🚗", "🍞"];

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  word?: Word | null;
  categories: string[];
  onSaved: () => void;
}

const NEW_CATEGORY = "__new__";

export function WordFormDialog({
  open,
  onOpenChange,
  word,
  categories,
  onSaved,
}: Props) {
  const isEdit = Boolean(word);
  const [creatingCategory, setCreatingCategory] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<WordFormValues>({
    resolver: zodResolver(wordSchema),
    defaultValues: {
      english: word?.english ?? "",
      uzbek: word?.uzbek ?? "",
      transcription: word?.transcription ?? "",
      example_en: word?.example_en ?? "",
      example_uz: word?.example_uz ?? "",
      category: word?.category ?? "umumiy",
      emoji: word?.emoji ?? "",
    },
  });

  const categoryValue = watch("category");
  const emojiValue = watch("emoji");

  // Dialog ochilganda (yoki boshqa so'z tanlanganda) formni yangilaymiz.
  // `defaultValues` faqat birinchi mountda ishlaydi, shuning uchun reset shart.
  useEffect(() => {
    if (!open) return;
    reset({
      english: word?.english ?? "",
      uzbek: word?.uzbek ?? "",
      transcription: word?.transcription ?? "",
      example_en: word?.example_en ?? "",
      example_uz: word?.example_uz ?? "",
      category: word?.category ?? "umumiy",
      emoji: word?.emoji ?? "",
    });
    setCreatingCategory(false);
  }, [open, word, reset]);

  async function onSubmit(values: WordFormValues) {
    const supabase = createClient();
    const payload = normalizeWord(values);

    let error;
    if (isEdit && word) {
      ({ error } = await supabase
        .from("words")
        .update(payload)
        .eq("id", word.id));
    } else {
      ({ error } = await supabase.from("words").insert(payload));
    }

    if (error) {
      toast.error("Xatolik: " + error.message);
      return;
    }

    toast.success(isEdit ? "So'z yangilandi ✅" : "So'z qo'shildi ✅");
    reset();
    setCreatingCategory(false);
    onOpenChange(false);
    onSaved();
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "So'zni tahrirlash ✏️" : "Yangi so'z qo'shish ➕"}
          </DialogTitle>
          <DialogDescription>
            Inglizcha so&apos;z va o&apos;zbekcha tarjimasi majburiy.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="english">Inglizcha *</Label>
              <Input id="english" {...register("english")} placeholder="apple" />
              {errors.english && (
                <p className="text-sm text-destructive">{errors.english.message}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="uzbek">O&apos;zbekcha *</Label>
              <Input id="uzbek" {...register("uzbek")} placeholder="olma" />
              {errors.uzbek && (
                <p className="text-sm text-destructive">{errors.uzbek.message}</p>
              )}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="transcription">Transkripsiya</Label>
              <Input
                id="transcription"
                {...register("transcription")}
                placeholder="[ˈæp.əl]"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="emoji">Emoji</Label>
              <Input id="emoji" {...register("emoji")} placeholder="🍎" />
              <div className="flex flex-wrap gap-1 pt-1">
                {EMOJI_SUGGESTIONS.map((e) => (
                  <button
                    key={e}
                    type="button"
                    onClick={() => setValue("emoji", e)}
                    className={`flex h-8 w-8 items-center justify-center rounded-lg border text-lg hover:bg-muted ${
                      emojiValue === e ? "border-primary bg-primary/10" : "border-border"
                    }`}
                  >
                    {e}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="example_en">Inglizcha misol</Label>
            <Textarea
              id="example_en"
              {...register("example_en")}
              placeholder="I eat a red apple."
              rows={2}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="example_uz">O&apos;zbekcha misol</Label>
            <Textarea
              id="example_uz"
              {...register("example_uz")}
              placeholder="Men qizil olma yeyman."
              rows={2}
            />
          </div>

          <div className="space-y-1.5">
            <Label>Kategoriya *</Label>
            {creatingCategory ? (
              <div className="flex gap-2">
                <Input
                  {...register("category")}
                  placeholder="yangi kategoriya nomi"
                  autoFocus
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setCreatingCategory(false);
                    setValue("category", categories[0] ?? "umumiy");
                  }}
                >
                  Bekor
                </Button>
              </div>
            ) : (
              <Select
                value={categoryValue}
                onValueChange={(v) => {
                  if (v === NEW_CATEGORY) {
                    setCreatingCategory(true);
                    setValue("category", "");
                  } else {
                    setValue("category", v);
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Kategoriya tanlang" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c} value={c}>
                      {categoryLabel(c)}
                    </SelectItem>
                  ))}
                  <SelectItem value={NEW_CATEGORY}>➕ Yangi kategoriya</SelectItem>
                </SelectContent>
              </Select>
            )}
            {errors.category && (
              <p className="text-sm text-destructive">{errors.category.message}</p>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Bekor qilish
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : isEdit ? (
                "Saqlash"
              ) : (
                "Qo'shish"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
