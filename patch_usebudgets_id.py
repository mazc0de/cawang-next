import re

with open("src/hooks/useBudgets.ts", "r") as f:
    content = f.read()

new_mutation = """    mutationFn: async (
      budget: Omit<
        Budget,
        "id" | "user_id"
        | "profile_id" | "created_at" | "updated_at" | "category" | "spent" | "account"
      > & { id?: string },
    ) => {
      if (!user || !activeProfile) throw new Error("Not authenticated or no active profile");
      
      if (budget.id) {
        // Edit mode explicitly provided ID
        const { id, ...updates } = budget;
        const { data, error } = await supabase
          .from("budgets")
          .update({ amount: updates.amount, account_id: updates.account_id })
          .eq("id", id)
          .eq("profile_id", activeProfile!.id)
          .select()
          .single();
        if (error) throw error;
        return data;
      }
      
      let query = supabase
        .from("budgets")
        .select("id")
        .eq("profile_id", activeProfile!.id)
        .eq("category_id", budget.category_id)
        .eq("cycle_year", budget.cycle_year)
        .eq("cycle_month", budget.cycle_month);
        
      if (budget.account_id) {
        query = query.eq("account_id", budget.account_id);
      } else {
        query = query.is("account_id", null);
      }
      
      const { data: existing } = await query.maybeSingle();

      if (existing) {
        const { data, error } = await supabase
          .from("budgets")
          .update({ amount: budget.amount })
          .eq("id", existing.id)
          .select()
          .single();
        if (error) throw error;
        return data;
      } else {
        const { data, error } = await supabase
          .from("budgets")
          .insert([{ ...budget, user_id: user.id, profile_id: activeProfile!.id }])
          .select()
          .single();
        if (error) throw error;
        return data;
      }
    },"""

content = re.sub(
    r'    mutationFn: async \([\s\S]*?return data;\n      \}\n    \},',
    new_mutation,
    content
)

with open("src/hooks/useBudgets.ts", "w") as f:
    f.write(content)
