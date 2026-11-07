// Standard recipes, expressed as whole crafting batches.
export const recipes = {
  'Smart Plating': { output: 1, ingredients: { 'Reinforced Iron Plate': 1, Rotor: 1 } },
  'Versatile Framework': { output: 2, ingredients: { 'Modular Frame': 1, 'Steel Beam': 12 } },
  'Automated Wiring': { output: 1, ingredients: { Stator: 1, Cable: 20 } }
};

export const MAX_QUANTITY = 1000000;

export function validGoal(goal) {
  return goal && typeof goal.item === 'string' && goal.item.trim().length > 0 &&
    goal.item.length <= 80 && Number.isSafeInteger(goal.quantity) &&
    goal.quantity > 0 && goal.quantity <= MAX_QUANTITY &&
    (goal.mode === 'manual' || (goal.mode === 'recipe' && Object.hasOwn(recipes, goal.item)));
}

export function calculateMaterials(goals = []) {
  const outputs = new Map();
  const inputs = new Map();
  for (const goal of goals.filter(validGoal)) {
    const key = `${goal.mode}:${goal.item}`;
    const current = outputs.get(key);
    if (current) current.quantity += goal.quantity;
    else outputs.set(key, { ...goal });
  }
  for (const goal of outputs.values()) {
    if (goal.mode !== 'recipe') {
      inputs.set(goal.item, (inputs.get(goal.item) || 0) + goal.quantity);
      continue;
    }
    const recipe = recipes[goal.item];
    const batches = Math.ceil(goal.quantity / recipe.output);
    for (const [item, amount] of Object.entries(recipe.ingredients)) {
      inputs.set(item, (inputs.get(item) || 0) + amount * batches);
    }
  }
  return {
    produce: [...outputs.values()].filter(goal => goal.mode === 'recipe'),
    supply: [...inputs].map(([item, quantity]) => ({ item, quantity }))
  };
}
