import google.generativeai as genai
import os

# Set your Gemini API key
genai.configure(api_key=os.environ.get("GEMINI_API_KEY"))

model = genai.GenerativeModel('gemini-2.5-pro')

def get_recipe_suggestions(ingredients, budget):
    prompt = f"""
    The user has the following ingredients: {ingredients}.
    Suggest 3 healthy, affordable Indian meals that can be made using them.
    Make it suitable for a single person and include meal names, small description, and why it's nutritious.
    """
    if budget:
        prompt += f"\nKeep the cost under ₹{budget} per meal."

    response = model.generate_content(prompt)
    return response.text

def get_weekly_meal_plan(ingredients, budget):
    prompt = f"""
    The user has: {ingredients}.
    Create a 7-day healthy Indian meal plan (breakfast, lunch, dinner).
    Include a grocery list for all meals.
    Meals should be nutritious and use affordable ingredients.

    Budget: ₹{budget} per day (if applicable)
    """
    response = model.generate_content(prompt)
    
    # Simple split for display purposes
    plan_text = response.text.split("Grocery List:")
    plan = plan_text[0].strip()
    grocery_list = plan_text[1].strip() if len(plan_text) > 1 else "Grocery list not found."

    return plan, grocery_list

def get_chat_response(user_input):
    prompt = f"""
You are a helpful AI meal planner assistant.

User Input: {user_input}

Your Response Should Include:
- A short friendly message acknowledging the user's ingredients
- 3 meal suggestions using the ingredients
- For each meal: name, short 1-line description, and why it's healthy
- Use clean formatting: numbered list or bullet points, bold dish names
- End with a tip or a question to keep the conversation going

Format clearly in markdown-like style for HTML formatting.
"""
    response = model.generate_content(prompt)
    return response.text.strip()
