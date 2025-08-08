from flask import Flask, render_template, request, redirect, url_for
from gemini_api import get_recipe_suggestions, get_weekly_meal_plan, get_chat_response
from flask import jsonify
app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/get_recipes', methods=['POST'])
def get_recipes():
    ingredients = request.form['ingredients']
    budget = request.form.get('budget', '')
    suggestions = get_recipe_suggestions(ingredients, budget)
    return render_template('index.html', ingredients=ingredients, suggestions=suggestions)

@app.route('/meal_plan', methods=['GET', 'POST'])
def meal_plan():
    ingredients = request.form['ingredients']
    budget = request.form.get('budget', '')
    plan, grocery_list = get_weekly_meal_plan(ingredients, budget)
    return render_template('meal_plan.html', plan=plan, grocery_list=grocery_list)

@app.route('/chat', methods=['POST'])
def chat():
    user_input = request.json.get('message')
    reply = get_chat_response(user_input)
    return jsonify({'reply': reply})

@app.route('/health')
def health():
    return "OK", 200

if __name__ == '__main__':
    app.run(debug=True)
