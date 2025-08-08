import google.generativeai as genai
import os
import re

genai.configure(api_key=os.environ.get("GEMINI_API_KEY"))

model = genai.GenerativeModel('gemini-2.5-pro')

def get_recipe_suggestions(ingredients, budget):
    prompt = f"""
    The user has the following ingredients: {ingredients}.
    Suggest 3 healthy, affordable Indian meals that can be made using them.
    Make it suitable for a single person.
    For each meal, provide:
    - **Meal Name:**
    - **Description:** A short, enticing description.
    - **Nutrition:** Why it's a nutritious choice.

    Format the entire response using Markdown.
    """
    if budget:
        prompt += f"\nKeep the cost under ₹{budget} per meal."

    response = model.generate_content(prompt)
    return response.text

def get_weekly_meal_plan(ingredients, budget):
    prompt = f"""
    The user has these ingredients: {ingredients}.
    Create a 7-day healthy Indian meal plan (Breakfast, Lunch, Dinner).
    Use Markdown to structure the plan with headings for each day.
    After the 7-day plan, include a "Grocery List" section.
    Meals should be nutritious and use affordable ingredients.
    """
    if budget:
        prompt += f"\nBudget: ₹{budget} per day."

    response = model.generate_content(prompt)
    
    parts = re.split(r'\n## Groc[eE]ry List\n', response.text, flags=re.IGNORECASE)
    plan = parts[0].strip()
    grocery_list = parts[1].strip() if len(parts) > 1 else "Grocery list not generated."

    return plan, grocery_list

def get_chat_response(user_input):
    prompt = f"""
You are a friendly and helpful AI meal planner. Your tone is encouraging and positive.

The user has the following ingredients: "{user_input}"

Your response should be structured in Markdown as follows:
- Start with a friendly, short message acknowledging the user's ingredients.
- Provide 3 meal suggestions based on the ingredients.
- For each meal, include:
    - ### **Meal Name**
    - A brief, one-line description of the dish.
    - A short bullet point on why it's a healthy choice.
- Use a numbered list for the meal suggestions.
- End with an engaging question to encourage a follow-up.
"""
    response = model.generate_content(prompt)
    return response.text.strip()