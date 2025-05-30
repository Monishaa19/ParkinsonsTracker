from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo import MongoClient

app = Flask(__name__)
CORS(app)

# Replace with your actual MongoDB connection string
client = MongoClient("mongodb+srv://thenameismonisha:p1YYlB0CvLHhY5Ht@cluster0.r7t3lf4.mongodb.net/")
db = client['parkinsons']  # Uses the default database from the URI


@app.route('/connectTheDots', methods=['POST'])
def save_score1():
    collection = db['connectTheDots']
    data = request.get_json()
    score = data.get('score')
    time = data.get('time')
    if score is None or time is None:
        return jsonify({'error': 'Missing score or time'}), 400

    doc = {'score': score, 'time': time}
    collection.insert_one(doc)
    return jsonify({'success': True}), 201

@app.route('/jitteryLine', methods=['POST'])
def save_score2():
    collection = db['jitteryLine']
    data = request.get_json()
    score = data.get('score')
    if score is None:
        return jsonify({'error': 'Missing jitter score'}), 400

    doc = {'score': score}
    collection.insert_one(doc)
    return jsonify({'success': True}), 201

@app.route('/garden', methods=['POST'])
def save_score3():
    collection = db['garden']
    data = request.get_json()
    time = data.get('time')
    if time is None:
        return jsonify({'error': 'Missing time'}), 400

    doc = {'time': time}
    collection.insert_one(doc)
    return jsonify({'success': True}), 201

@app.route('/buttonSmash', methods=['POST'])
def save_score4():
    collection = db['buttonSmash']
    data = request.get_json()
    score = data.get('score')
    if score is None:
        return jsonify({'error': 'Missing number of presses'}), 400

    doc = {'score': score}
    collection.insert_one(doc)
    return jsonify({'success': True}), 201

@app.route('/brainDots', methods=['POST'])
def save_score5():
    collection = db['brainDots']
    data = request.get_json()
    score = data.get('score')
    if score is None:
        return jsonify({'error': 'Missing moves'}), 400

    doc = {'score': score}
    collection.insert_one(doc)
    return jsonify({'success': True}), 201

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)