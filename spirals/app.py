import os
import cv2
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_squared_error
import pickle

# Paths
images_folder = r"c:\Documents\ParkinsonsTracker\spirals"
smoothness_file = os.path.join(images_folder, "spirals.txt")

# Step 1: Load Smoothness Values
with open(smoothness_file, "r") as f:
    smoothness_values = [float(line.strip()) for line in f.readlines()]

# Step 2: Preprocess Images and Extract Features
def preprocess_image(image_path):
    # Load the image
    img = cv2.imread(image_path, cv2.IMREAD_GRAYSCALE)
    # Resize to a fixed size (e.g., 128x128)
    img_resized = cv2.resize(img, (128, 128))
    # Flatten the image into a 1D array
    features = img_resized.flatten()
    return features

# Load all images and extract features
image_files = sorted([f for f in os.listdir(images_folder) if f.endswith(".jpeg")])
X = []
for image_file in image_files:
    image_path = os.path.join(images_folder, image_file)
    features = preprocess_image(image_path)
    X.append(features)

# Convert to NumPy array
X = np.array(X)
y = np.array(smoothness_values)

# Step 3: Split Dataset into Training and Testing Sets
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Step 4: Train a Machine Learning Model
model = RandomForestRegressor(n_estimators=100, random_state=42)
model.fit(X_train, y_train)

# Step 5: Evaluate the Model
y_pred = model.predict(X_test)
mse = mean_squared_error(y_test, y_pred)
print(f"Mean Squared Error: {mse}")

# Step 6: Save the Model
model_path = "smoothness_model.pkl"
with open(model_path, "wb") as f:
    pickle.dump(model, f)
print(f"Model saved to {model_path}")

# Step 7: Predict Smoothness for New Images
def predict_smoothness(image_path, model_path="smoothness_model.pkl"):
    # Load the trained model
    with open(model_path, "rb") as f:
        model = pickle.load(f)
    # Preprocess the image
    features = preprocess_image(image_path)
    features = np.array(features).reshape(1, -1)
    # Predict smoothness
    smoothness = model.predict(features)[0]
    return smoothness



for i in range(1, 11):
    new_image_path = rf"c:\Documents\ParkinsonsTracker\spirals\{i}.jpeg"
    predicted_smoothness = predict_smoothness(new_image_path)
    print(f"Predicted Smoothness: {predicted_smoothness}")