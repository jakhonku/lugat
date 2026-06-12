import { getCategories } from "@/lib/queries";
import { WordsManager } from "@/components/admin/WordsManager";

export const dynamic = "force-dynamic";

export default async function AdminWordsPage() {
  const categories = await getCategories();
  return <WordsManager initialCategories={categories} />;
}
